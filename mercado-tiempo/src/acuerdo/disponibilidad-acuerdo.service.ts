/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/disponibilidad-acuerdo.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { calcularCoincidencia, Intervalo, ResultadoCoincidencia } from './coincidencia-horarios';

export interface DisponibilidadParticipante {
    perfilId: string;
    rol: RolParticipante;
    envioDisponibilidad: boolean;
    franjas: Intervalo[];
}

export interface DisponibilidadAcuerdo {
    participantes: DisponibilidadParticipante[];
    resultado: ResultadoCoincidencia;
    horarioAcordado: Intervalo | null;
}

// --- Coordinación de horarios de un acuerdo (RF-037, RF-038, RF-039) ---
//
// 1. Cada participante envía sus franjas (las del autor del post de origen ya cuentan, RF-036).
// 2. Cuando todos enviaron, se buscan horarios comunes que duren al menos las horas del acuerdo.
// 3. Si hay uno, se asigna solo: se guarda como horario acordado, se fija la fechaRealizacion
//    y el acuerdo pasa de "en creación" a "acordado".

@Injectable()
export class DisponibilidadAcuerdoService {
    constructor(
        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(ParticipanteAcuerdoEntity)
        private readonly participanteRepository: Repository<ParticipanteAcuerdoEntity>,

        @InjectRepository(HorarioDisponibleEntity)
        private readonly horarioRepository: Repository<HorarioDisponibleEntity>
    ) {}

    // --- Consultar disponibilidades y resultado ---

    async findDisponibilidad(acuerdoId: string): Promise<DisponibilidadAcuerdo> {
        const acuerdo = await this.findAcuerdo(acuerdoId);
        const participantes = await this.disponibilidadesDe(acuerdo);

        const horarioAcordado = acuerdo.horarioAcordado
            ? { inicio: acuerdo.horarioAcordado.fechaInicio, fin: acuerdo.horarioAcordado.fechaFin }
            : null;

        return { participantes, resultado: this.evaluar(acuerdo, participantes), horarioAcordado };
    }

    // --- Registrar (o reemplazar) la disponibilidad de un participante ---

    async registrarDisponibilidad(acuerdoId: string, perfilId: string, franjas: Intervalo[]): Promise<DisponibilidadAcuerdo> {
        const acuerdo = await this.findAcuerdo(acuerdoId);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("The acuerdo is realizado and cannot be modified", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("The acuerdo is cancelado and cannot be modified", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.horarioAcordado)
            throw new BusinessLogicException("The acuerdo already has a horario acordado", BusinessError.PRECONDITION_FAILED);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        for (const franja of franjas) {
            if (isNaN(new Date(franja.inicio).getTime()) || isNaN(new Date(franja.fin).getTime())
                || new Date(franja.fin).getTime() <= new Date(franja.inicio).getTime())
                throw new BusinessLogicException("The fechaFin of a horario must be after its fechaInicio", BusinessError.PRECONDITION_FAILED);
        }

        await this.acuerdoRepository.manager.transaction(async manager => {
            // Reemplaza las franjas anteriores de este participante en este acuerdo
            await manager.delete(HorarioDisponibleEntity, { acuerdo: { id: acuerdoId }, perfil: { id: perfilId } });
            await manager.save(HorarioDisponibleEntity, franjas.map(franja => manager.create(HorarioDisponibleEntity, {
                fechaInicio: franja.inicio,
                fechaFin: franja.fin,
                acuerdo: { id: acuerdoId },
                perfil: { id: perfilId },
            })));
            await manager.update(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId, idPerfil: perfilId }, { envioDisponibilidad: true });
        });

        // RF-039: si ya hay un horario común suficiente, se asigna
        const actualizado = await this.findAcuerdo(acuerdoId);
        const resultado = this.evaluar(actualizado, await this.disponibilidadesDe(actualizado));
        if (resultado.estado === 'compatible')
            await this.asignarHorario(actualizado, resultado.intervalo);

        return await this.findDisponibilidad(acuerdoId);
    }

    // --- Auxiliares ---

    private evaluar(acuerdo: AcuerdoEntity, participantes: DisponibilidadParticipante[]): ResultadoCoincidencia {
        if (participantes.length === 0 || participantes.some(p => !p.envioDisponibilidad))
            return { estado: 'pendiente' };
        return calcularCoincidencia(acuerdo.horas, participantes.map(p => p.franjas));
    }

    // Franjas de cada participante. El autor del post de origen ya dio su disponibilidad al publicarlo.
    private async disponibilidadesDe(acuerdo: AcuerdoEntity): Promise<DisponibilidadParticipante[]> {
        const franjasDelAcuerdo = await this.horarioRepository.find({
            where: { acuerdo: { id: acuerdo.id } },
            relations: { perfil: true }
        });
        const franjasDelPost = acuerdo.postAyuda
            ? await this.horarioRepository.find({ where: { postAyuda: { id: acuerdo.postAyuda.id } } })
            : [];
        const autorDelPost = acuerdo.postAyuda?.perfilAutor?.id;

        return acuerdo.participantes.map(p => {
            const usaFranjasDelPost = !p.envioDisponibilidad && p.idPerfil === autorDelPost && franjasDelPost.length > 0;
            const franjas = usaFranjasDelPost
                ? franjasDelPost
                : franjasDelAcuerdo.filter(h => h.perfil?.id === p.idPerfil && h.id !== acuerdo.horarioAcordado?.id);

            return {
                perfilId: p.idPerfil,
                rol: p.rol,
                envioDisponibilidad: p.envioDisponibilidad || usaFranjasDelPost,
                franjas: franjas
                    .map(h => ({ inicio: h.fechaInicio, fin: h.fechaFin }))
                    .sort((a, b) => new Date(a.inicio).getTime() - new Date(b.inicio).getTime()),
            };
        });
    }

    private async asignarHorario(acuerdo: AcuerdoEntity, intervalo: Intervalo) {
        await this.acuerdoRepository.manager.transaction(async manager => {
            const horario = await manager.save(HorarioDisponibleEntity, manager.create(HorarioDisponibleEntity, {
                fechaInicio: intervalo.inicio,
                fechaFin: intervalo.fin,
                acuerdo: { id: acuerdo.id },
            }));
            await manager.update(AcuerdoEntity, acuerdo.id, {
                horarioAcordado: { id: horario.id },
                fechaRealizacion: intervalo.inicio,
                estado: acuerdo.estado === EstadoAcuerdo.EN_CREACION ? EstadoAcuerdo.ACORDADO : acuerdo.estado,
            });
        });
    }

    private async findAcuerdo(acuerdoId: string): Promise<AcuerdoEntity> {
        const acuerdo = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true, horarioAcordado: true, postAyuda: { perfilAutor: true } }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        return acuerdo;
    }
}

