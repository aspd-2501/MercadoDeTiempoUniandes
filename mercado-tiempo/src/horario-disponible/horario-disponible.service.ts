/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { HorarioDisponibleEntity } from './horario-disponible.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ActividadComunitariaEntity } from '../actividad-comunitaria/actividad-comunitaria.entity';

@Injectable()
export class HorarioDisponibleService {
    constructor(
        @InjectRepository(HorarioDisponibleEntity)
        private readonly horarioRepository: Repository<HorarioDisponibleEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(SolicitudAyudaEntity)
        private readonly solicitudRepository: Repository<SolicitudAyudaEntity>,

        @InjectRepository(PostAyudaEntity)
        private readonly postAyudaRepository: Repository<PostAyudaEntity>,

        @InjectRepository(ActividadComunitariaEntity)
        private readonly actividadRepository: Repository<ActividadComunitariaEntity>
    ) {}

    async findAll(): Promise<HorarioDisponibleEntity[]> {
        return await this.horarioRepository.find({
            relations: { acuerdo: true, solicitud: true, postAyuda: true, actividad: true, perfil: true }
        });
    }

    async findOne(id: string): Promise<HorarioDisponibleEntity> {
        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({
            where: { id },
            relations: { acuerdo: true, solicitud: true, postAyuda: true, actividad: true, perfil: true }
        });
        if (!horario)
            throw new BusinessLogicException("No se encontró el horario disponible", BusinessError.NOT_FOUND);
        return horario;
    }

    async create(horario: HorarioDisponibleEntity): Promise<HorarioDisponibleEntity> {
        if (!horario.perfil)
            throw new BusinessLogicException("Un horario disponible debe tener un perfil", BusinessError.PRECONDITION_FAILED);
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: horario.perfil.id } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        if (horario.fechaFin <= horario.fechaInicio)
            throw new BusinessLogicException("La fecha de fin debe ser posterior a la de inicio", BusinessError.PRECONDITION_FAILED);

        await this.validarOrigen(horario);

        return await this.horarioRepository.save(horario);
    }

    async delete(id: string) {
        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({ where: { id } });
        if (!horario)
            throw new BusinessLogicException("No se encontró el horario disponible", BusinessError.NOT_FOUND);
        await this.horarioRepository.remove(horario);
    }

    // --- Validación de origen único: acuerdo, solicitud, postAyuda o actividad (espejo del CHECK) ---

    private async validarOrigen(horario: HorarioDisponibleEntity) {
        const origenes = [
            { valor: horario.acuerdo, nombre: 'acuerdo' },
            { valor: horario.solicitud, nombre: 'solicitud' },
            { valor: horario.postAyuda, nombre: 'postAyuda' },
            { valor: horario.actividad, nombre: 'actividad' },
        ].filter(o => !!o.valor);

        if (origenes.length !== 1)
            throw new BusinessLogicException(
                "Un horario disponible debe tener exactamente un origen: un acuerdo, una solicitud, un post de ayuda o una actividad",
                BusinessError.PRECONDITION_FAILED
            );

        const [{ valor, nombre }] = origenes;

        if (nombre === 'acuerdo') {
            const acuerdo = await this.acuerdoRepository.findOne({ where: { id: valor.id } });
            if (!acuerdo)
                throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        } else if (nombre === 'solicitud') {
            const solicitud = await this.solicitudRepository.findOne({ where: { id: valor.id } });
            if (!solicitud)
                throw new BusinessLogicException("No se encontró la solicitud", BusinessError.NOT_FOUND);
        } else if (nombre === 'postAyuda') {
            const post = await this.postAyudaRepository.findOne({ where: { id: valor.id } });
            if (!post)
                throw new BusinessLogicException("No se encontró el post de ayuda", BusinessError.NOT_FOUND);
        } else {
            const actividad = await this.actividadRepository.findOne({ where: { id: valor.id } });
            if (!actividad)
                throw new BusinessLogicException("No se encontró la actividad comunitaria", BusinessError.NOT_FOUND);
        }
    }
}