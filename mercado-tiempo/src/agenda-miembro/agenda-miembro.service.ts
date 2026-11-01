/* eslint-disable prettier/prettier */
/* archivo: src/agenda-miembro/agenda-miembro.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity } from '../acuerdo/participante-acuerdo.entity';
import { InscripcionActividadEntity } from '../actividad-comunitaria/inscripcion-actividad.entity';

// --- Grupos de acuerdos que ve un miembro en su Actividad (RF-057) ---
export enum FiltroAcuerdos {
    PENDIENTES = 'pendientes',     // en creación, acordados o en modificación: aún por ejecutar o finalizar
    COMPLETADOS = 'completados',   // realizados
    CANCELADOS = 'cancelados',
}

const ESTADOS_POR_FILTRO: Record<FiltroAcuerdos, EstadoAcuerdo[]> = {
    [FiltroAcuerdos.PENDIENTES]: [EstadoAcuerdo.EN_CREACION, EstadoAcuerdo.ACORDADO, EstadoAcuerdo.EN_MODIFICACION],
    [FiltroAcuerdos.COMPLETADOS]: [EstadoAcuerdo.REALIZADO],
    [FiltroAcuerdos.CANCELADOS]: [EstadoAcuerdo.CANCELADO],
};

// --- Un elemento del calendario personal (RF-035) ---
export interface EventoCalendario {
    tipo: 'ACUERDO' | 'ACTIVIDAD';
    id: string;               // id del acuerdo o de la actividad
    titulo: string;           // título del post, de la solicitud o de la actividad
    inicio: Date;
    fin: Date;
    participantes: string[];  // nombres de los demás participantes (vacío en actividades)
}

@Injectable()
export class AgendaMiembroService {
    constructor(
        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ParticipanteAcuerdoEntity)
        private readonly participanteRepository: Repository<ParticipanteAcuerdoEntity>,

        @InjectRepository(InscripcionActividadEntity)
        private readonly inscripcionRepository: Repository<InscripcionActividadEntity>
    ) {}

    // --- Acuerdos de un miembro, opcionalmente filtrados (RF-057) ---
    // Los pendientes van ordenados por fecha de realización, los demás del más reciente al más antiguo.

    async findAcuerdos(perfilId: string, filtro?: FiltroAcuerdos): Promise<AcuerdoEntity[]> {
        await this.findPerfil(perfilId);

        if (filtro && !Object.values(FiltroAcuerdos).includes(filtro))
            throw new BusinessLogicException("The filtro must be pendientes, completados or cancelados", BusinessError.BAD_REQUEST);

        const participaciones = await this.participanteRepository.find({
            where: { idPerfil: perfilId },
            relations: {
                acuerdo: { participantes: { perfil: true }, postAyuda: true, solicitud: true, horarioAcordado: true }
            }
        });

        let acuerdos = participaciones.map(p => p.acuerdo);
        if (filtro)
            acuerdos = acuerdos.filter(a => ESTADOS_POR_FILTRO[filtro].includes(a.estado));

        const fecha = (a: AcuerdoEntity) => new Date(a.fechaRealizacion).getTime();
        return filtro === FiltroAcuerdos.PENDIENTES
            ? acuerdos.sort((a, b) => fecha(a) - fecha(b))
            : acuerdos.sort((a, b) => fecha(b) - fecha(a));
    }

    // --- Calendario personal (RF-035) ---
    // Acuerdos con horario asignado que siguen vigentes, y actividades comunitarias en las que está inscrito.

    async findCalendario(perfilId: string, desde?: Date, hasta?: Date): Promise<EventoCalendario[]> {
        await this.findPerfil(perfilId);

        if ((desde && isNaN(desde.getTime())) || (hasta && isNaN(hasta.getTime())))
            throw new BusinessLogicException("The desde and hasta must be valid dates", BusinessError.BAD_REQUEST);
        if (desde && hasta && hasta.getTime() < desde.getTime())
            throw new BusinessLogicException("The hasta must be after desde", BusinessError.BAD_REQUEST);

        const eventos: EventoCalendario[] = [];

        // Acuerdos programados (acordados o en modificación) con horario acordado
        const vigentes = [EstadoAcuerdo.ACORDADO, EstadoAcuerdo.EN_MODIFICACION];
        const acuerdos = await this.findAcuerdos(perfilId);
        for (const acuerdo of acuerdos) {
            if (!acuerdo.horarioAcordado || !vigentes.includes(acuerdo.estado)) continue;
            eventos.push({
                tipo: 'ACUERDO',
                id: acuerdo.id,
                titulo: acuerdo.postAyuda?.titulo ?? acuerdo.solicitud?.titulo ?? 'Acuerdo de servicio',
                inicio: acuerdo.horarioAcordado.fechaInicio,
                fin: acuerdo.horarioAcordado.fechaFin,
                participantes: acuerdo.participantes
                    .filter(p => p.idPerfil !== perfilId)
                    .map(p => p.perfil.nombre),
            });
        }

        // Actividades comunitarias en las que está inscrito, una entrada por cada fecha del evento
        const inscripciones = await this.inscripcionRepository.find({
            where: { idPerfil: perfilId },
            relations: { actividad: { fechaEvento: true } }
        });
        for (const { actividad } of inscripciones) {
            for (const fecha of actividad.fechaEvento ?? []) {
                eventos.push({
                    tipo: 'ACTIVIDAD',
                    id: actividad.id,
                    titulo: actividad.titulo,
                    inicio: fecha.fechaInicio,
                    fin: fecha.fechaFin,
                    participantes: [],
                });
            }
        }

        // Solo los que se cruzan con el rango pedido, en orden cronológico
        const ms = (d: Date) => new Date(d).getTime();
        return eventos
            .filter(e => (!desde || ms(e.fin) >= desde.getTime()) && (!hasta || ms(e.inicio) <= hasta.getTime()))
            .sort((a, b) => ms(a.inicio) - ms(b.inicio));
    }

    private async findPerfil(perfilId: string) {
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
        return perfil;
    }
}
