/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { AprobacionModificacionEntity } from './aprobacion-modificacion.entity';
import { EstadoSolicitudModificacion, TipoSolicitudModificacion } from './estado-solicitud-modificacion.enum';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from '../acuerdo/participante-acuerdo.entity';

@Injectable()
export class SolicitudModificacionService {
    constructor(
        @InjectRepository(SolicitudModificacionEntity)
        private readonly solicitudRepository: Repository<SolicitudModificacionEntity>,

        @InjectRepository(AprobacionModificacionEntity)
        private readonly aprobacionRepository: Repository<AprobacionModificacionEntity>,

        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(ParticipanteAcuerdoEntity)
        private readonly participanteRepository: Repository<ParticipanteAcuerdoEntity>
    ) {}

    // --- Consultas ---

    async findAllByAcuerdoId(acuerdoId: string): Promise<SolicitudModificacionEntity[]> {
        await this.findAcuerdo(acuerdoId);
        return await this.solicitudRepository.find({
            where: { acuerdo: { id: acuerdoId } },
            relations: { solicitante: true, aprobaciones: true },
            order: { fechaCreacion: 'DESC' }
        });
    }

    async findOne(acuerdoId: string, id: string): Promise<SolicitudModificacionEntity> {
        await this.findAcuerdo(acuerdoId);
        const solicitud: SolicitudModificacionEntity | null = await this.solicitudRepository.findOne({
            where: { id, acuerdo: { id: acuerdoId } },
            relations: { acuerdo: true, solicitante: true, aprobaciones: true }
        });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud de modificacion with the given id was not found", BusinessError.NOT_FOUND);
        return solicitud;
    }

    // --- Crear una propuesta (RF-033, RF-040) ---
    // El acuerdo vigente no cambia (RF-041): solo pasa a "en modificación" mientras la propuesta está pendiente.

    async create(acuerdoId: string, solicitud: SolicitudModificacionEntity): Promise<SolicitudModificacionEntity> {
        const acuerdo = await this.findAcuerdo(acuerdoId);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("The acuerdo is realizado and cannot be modified", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("The acuerdo is cancelado and cannot be modified", BusinessError.PRECONDITION_FAILED);

        if (!solicitud.solicitante)
            throw new BusinessLogicException("A solicitud de modificacion must have a solicitante", BusinessError.PRECONDITION_FAILED);
        await this.validarParticipante(acuerdoId, solicitud.solicitante.id);

        const pendiente = await this.solicitudRepository.findOne({
            where: { acuerdo: { id: acuerdoId }, estado: EstadoSolicitudModificacion.PENDIENTE }
        });
        if (pendiente)
            throw new BusinessLogicException("The acuerdo already has a pending solicitud de modificacion", BusinessError.PRECONDITION_FAILED);

        if (solicitud.tipo === TipoSolicitudModificacion.MODIFICACION) {
            if (solicitud.horas == null && !solicitud.fechaRealizacion)
                throw new BusinessLogicException("A modificacion must change the horas or the fechaRealizacion", BusinessError.PRECONDITION_FAILED);
            if (solicitud.horas != null && solicitud.horas <= 0)
                throw new BusinessLogicException("The horas of a solicitud de modificacion must be positive", BusinessError.PRECONDITION_FAILED);
            if (solicitud.horas != null)
                await this.validarSaldoReceptores(acuerdoId, solicitud.horas);
        } else if (solicitud.tipo === TipoSolicitudModificacion.CANCELACION) {
            solicitud.horas = null;
            solicitud.fechaRealizacion = null as unknown as Date;
        } else {
            throw new BusinessLogicException("The tipo must be MODIFICACION or CANCELACION", BusinessError.PRECONDITION_FAILED);
        }

        solicitud.acuerdo = acuerdo;
        solicitud.fechaCreacion = new Date();
        solicitud.estado = EstadoSolicitudModificacion.PENDIENTE;
        solicitud.estadoAcuerdoAnterior = acuerdo.estado;
        const nueva = await this.solicitudRepository.save(solicitud);

        acuerdo.estado = EstadoAcuerdo.EN_MODIFICACION;
        await this.acuerdoRepository.save(acuerdo);

        // Quien propone, la aprueba automáticamente
        await this.aprobacionRepository.save(
            this.aprobacionRepository.create({ idSolicitud: nueva.id, idPerfil: solicitud.solicitante.id })
        );
        await this.resolverSiTodosAprobaron(acuerdoId, nueva.id);

        return await this.findOne(acuerdoId, nueva.id);
    }

    // --- Aprobar (RF-042): se aplica solo cuando TODOS los participantes aprobaron ---

    async aprobar(acuerdoId: string, id: string, perfilId: string): Promise<SolicitudModificacionEntity> {
        const solicitud = await this.findPendiente(acuerdoId, id);
        await this.validarParticipante(acuerdoId, perfilId);

        if (solicitud.aprobaciones.some(a => a.idPerfil === perfilId))
            throw new BusinessLogicException("The perfil already approved the solicitud de modificacion", BusinessError.PRECONDITION_FAILED);

        await this.aprobacionRepository.save(this.aprobacionRepository.create({ idSolicitud: id, idPerfil: perfilId }));
        await this.resolverSiTodosAprobaron(acuerdoId, id);

        return await this.findOne(acuerdoId, id);
    }

    // --- Rechazar: descarta una MODIFICACION; una CANCELACION no se puede rechazar ---

    async rechazar(acuerdoId: string, id: string, perfilId: string): Promise<SolicitudModificacionEntity> {
        const solicitud = await this.findPendiente(acuerdoId, id);
        await this.validarParticipante(acuerdoId, perfilId);

        if (solicitud.tipo === TipoSolicitudModificacion.CANCELACION)
            throw new BusinessLogicException("A solicitud de cancelacion cannot be rejected; it needs the approval of all participantes", BusinessError.PRECONDITION_FAILED);

        await this.cerrar(solicitud, EstadoSolicitudModificacion.RECHAZADA);
        return await this.findOne(acuerdoId, id);
    }

    // --- Retirar: solo el solicitante, mientras siga pendiente ---

    async retirar(acuerdoId: string, id: string, perfilId: string): Promise<SolicitudModificacionEntity> {
        const solicitud = await this.findPendiente(acuerdoId, id);

        if (solicitud.solicitante.id !== perfilId)
            throw new BusinessLogicException("Only the solicitante can withdraw the solicitud de modificacion", BusinessError.PRECONDITION_FAILED);

        await this.cerrar(solicitud, EstadoSolicitudModificacion.RETIRADA);
        return await this.findOne(acuerdoId, id);
    }

    // --- Auxiliares ---

    // Si todos los participantes aprobaron, aplica el cambio al acuerdo
    private async resolverSiTodosAprobaron(acuerdoId: string, id: string) {
        const solicitud = await this.findOne(acuerdoId, id);
        const participantes = await this.participanteRepository.find({ where: { idAcuerdo: acuerdoId } });
        const aprobados = new Set(solicitud.aprobaciones.map(a => a.idPerfil));
        if (!participantes.every(p => aprobados.has(p.idPerfil)))
            return;

        const acuerdo = solicitud.acuerdo;
        if (solicitud.tipo === TipoSolicitudModificacion.CANCELACION) {
            acuerdo.estado = EstadoAcuerdo.CANCELADO;                       // RF-034
        } else {
            if (solicitud.horas != null) acuerdo.horas = solicitud.horas;
            if (solicitud.fechaRealizacion) acuerdo.fechaRealizacion = solicitud.fechaRealizacion;
            acuerdo.estado = solicitud.estadoAcuerdoAnterior;
        }
        await this.acuerdoRepository.save(acuerdo);

        solicitud.estado = EstadoSolicitudModificacion.APROBADA;
        await this.solicitudRepository.save(solicitud);
    }

    // Cierra la propuesta sin aplicarla y devuelve el acuerdo a su estado anterior
    private async cerrar(solicitud: SolicitudModificacionEntity, estado: EstadoSolicitudModificacion) {
        const acuerdo = solicitud.acuerdo;
        acuerdo.estado = solicitud.estadoAcuerdoAnterior;
        await this.acuerdoRepository.save(acuerdo);

        solicitud.estado = estado;
        await this.solicitudRepository.save(solicitud);
    }

    private async findPendiente(acuerdoId: string, id: string): Promise<SolicitudModificacionEntity> {
        const solicitud = await this.findOne(acuerdoId, id);
        if (solicitud.estado !== EstadoSolicitudModificacion.PENDIENTE)
            throw new BusinessLogicException("The solicitud de modificacion is no longer pending", BusinessError.PRECONDITION_FAILED);
        return solicitud;
    }

    // Todos los receptores deben poder pagar las nuevas horas (RF-043)
    private async validarSaldoReceptores(acuerdoId: string, horas: number) {
        const receptores = await this.participanteRepository.find({
            where: { idAcuerdo: acuerdoId, rol: RolParticipante.RECEPTOR },
            relations: { perfil: true }
        });
        if (receptores.some(r => r.perfil.saldo < horas))
            throw new BusinessLogicException("A RECEPTOR of the acuerdo does not have enough saldo for the new horas", BusinessError.PRECONDITION_FAILED);
    }

    private async validarParticipante(acuerdoId: string, perfilId: string) {
        const participante = await this.participanteRepository.findOne({ where: { idAcuerdo: acuerdoId, idPerfil: perfilId } });
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);
    }

    private async findAcuerdo(acuerdoId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id: acuerdoId } });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        return acuerdo;
    }
}
