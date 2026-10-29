/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { ChatEntity } from '../chat/chat.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

@Injectable()
export class AcuerdoService {
    constructor(
        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ParticipanteAcuerdoEntity)
        private readonly participanteRepository: Repository<ParticipanteAcuerdoEntity>,

        @InjectRepository(HorarioDisponibleEntity)
        private readonly horarioRepository: Repository<HorarioDisponibleEntity>,

        @InjectRepository(ChatEntity)
        private readonly chatRepository: Repository<ChatEntity>
    ) {}

    // --- CRUD de Acuerdo ---

    async findAll(): Promise<AcuerdoEntity[]> {
        return await this.acuerdoRepository.find({
            relations: { postAyuda: true, solicitud: true, participantes: true, horariosDisponibles: true, horarioAcordado: true, chat: true, solicitudesModificacion: true }
        });
    }

    async findOne(id: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id },
            relations: { postAyuda: true, solicitud: true, participantes: true, horariosDisponibles: true, horarioAcordado: true, chat: true, solicitudesModificacion: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        return acuerdo;
    }

    async create(acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        if (!!acuerdo.postAyuda === !!acuerdo.solicitud)
            throw new BusinessLogicException("An acuerdo must have either a postAyuda or a solicitud, but not both", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("An acuerdo becomes realizado only when all participantes confirm the prestacion", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("An acuerdo cannot be created as cancelado", BusinessError.PRECONDITION_FAILED);

        acuerdo.estado = acuerdo.estado ?? EstadoAcuerdo.EN_CREACION;
        return await this.acuerdoRepository.save(acuerdo);
    }

    async update(id: string, acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        const persisted: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        this.validarAcuerdoActivo(persisted);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("An acuerdo becomes realizado only when all participantes confirm the prestacion", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("An acuerdo can only be cancelado through a solicitud de cancelacion", BusinessError.PRECONDITION_FAILED);

        // Si cambian las horas, todos los receptores deben poder pagarlas
        if (acuerdo.horas != null && acuerdo.horas !== persisted.horas)
            await this.validarSaldoReceptores(id, acuerdo.horas);

        acuerdo.estado = acuerdo.estado ?? persisted.estado;

        acuerdo.id = id;
        return await this.acuerdoRepository.save(acuerdo);
    }

    async delete(id: string) {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id } });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        await this.acuerdoRepository.remove(acuerdo);
    }

    // --- Relación con PerfilMiembro (vía ParticipanteAcuerdo, con rol) ---

    async addParticipanteAcuerdo(acuerdoId: string, perfilId: string, rol: RolParticipante): Promise<AcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const yaParticipa = acuerdo.participantes.some(p => p.idPerfil === perfilId);
        if (yaParticipa)
            throw new BusinessLogicException("The perfil is already a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        if (rol === RolParticipante.RECEPTOR)
            this.validarSaldoReceptor(perfil, acuerdo.horas);

        const participante = this.participanteRepository.create({ idAcuerdo: acuerdoId, idPerfil: perfilId, rol });
        await this.participanteRepository.save(participante);

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async findParticipanteByAcuerdoIdPerfilId(acuerdoId: string, perfilId: string): Promise<ParticipanteAcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        return participante;
    }

    async findParticipantesByAcuerdoId(acuerdoId: string): Promise<ParticipanteAcuerdoEntity[]> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: { perfil: true } }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        return acuerdo.participantes;
    }

    async associateParticipantesAcuerdo(
        acuerdoId: string,
        participantes: { perfilId: string; rol: RolParticipante }[]
    ): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        for (const p of participantes) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: p.perfilId } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
            if (p.rol === RolParticipante.RECEPTOR)
                this.validarSaldoReceptor(perfil, acuerdo.horas);
        }

        await this.participanteRepository.delete({ idAcuerdo: acuerdoId });

        const nuevosParticipantes = participantes.map(p =>
            this.participanteRepository.create({ idAcuerdo: acuerdoId, idPerfil: p.perfilId, rol: p.rol })
        );
        await this.participanteRepository.save(nuevosParticipantes);

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async deleteParticipanteAcuerdo(acuerdoId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        await this.participanteRepository.delete({ idAcuerdo: acuerdoId, idPerfil: perfilId });
    }

    // --- Horario acordado: debe ser uno de los horarios propuestos para el acuerdo, su post o su solicitud ---

    async setHorarioAcordado(acuerdoId: string, horarioId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { postAyuda: true, solicitud: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({
            where: { id: horarioId },
            relations: { acuerdo: true, postAyuda: true, solicitud: true }
        });
        if (!horario)
            throw new BusinessLogicException("The horario disponible with the given id was not found", BusinessError.NOT_FOUND);

        const perteneceAlAcuerdo =
            horario.acuerdo?.id === acuerdo.id ||
            (!!acuerdo.postAyuda && horario.postAyuda?.id === acuerdo.postAyuda.id) ||
            (!!acuerdo.solicitud && horario.solicitud?.id === acuerdo.solicitud.id);
        if (!perteneceAlAcuerdo)
            throw new BusinessLogicException("The horario disponible is not associated with the acuerdo", BusinessError.PRECONDITION_FAILED);

        acuerdo.horarioAcordado = horario;
        await this.acuerdoRepository.save(acuerdo);
        return await this.findOne(acuerdoId);
    }

    async deleteHorarioAcordado(acuerdoId: string): Promise<AcuerdoEntity> {
        const acuerdo = await this.findOne(acuerdoId);
        this.validarAcuerdoActivo(acuerdo);
        acuerdo.horarioAcordado = null;
        await this.acuerdoRepository.save(acuerdo);
        return await this.findOne(acuerdoId);
    }

    // --- Chat del acuerdo ---

    async setChatAcuerdo(acuerdoId: string, chatId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id: acuerdoId } });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        const chat: ChatEntity | null = await this.chatRepository.findOne({ where: { id: chatId }, relations: { acuerdo: true } });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);
        if (chat.acuerdo && chat.acuerdo.id !== acuerdoId)
            throw new BusinessLogicException("The chat already belongs to another acuerdo", BusinessError.PRECONDITION_FAILED);

        acuerdo.chat = chat;
        await this.acuerdoRepository.save(acuerdo);
        return await this.findOne(acuerdoId);
    }

    // --- Confirmación de prestación (RF-044, RF-045) ---
    // Cuando TODOS los participantes confirman, se transfieren las horas y el acuerdo queda realizado (RF-046).

    async confirmarPrestacion(acuerdoId: string, perfilId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        if (acuerdo.estado !== EstadoAcuerdo.ACORDADO)
            throw new BusinessLogicException("The acuerdo must be acordado to confirm the prestacion", BusinessError.PRECONDITION_FAILED);

        if (new Date(acuerdo.fechaRealizacion).getTime() > Date.now())
            throw new BusinessLogicException("The prestacion cannot be confirmed before the fechaRealizacion", BusinessError.PRECONDITION_FAILED);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        if (participante.confirmoPrestacion)
            throw new BusinessLogicException("The perfil already confirmed the prestacion", BusinessError.PRECONDITION_FAILED);

        const tienePrestador = acuerdo.participantes.some(p => p.rol === RolParticipante.PRESTADOR);
        const tieneReceptor = acuerdo.participantes.some(p => p.rol === RolParticipante.RECEPTOR);
        if (!tienePrestador || !tieneReceptor)
            throw new BusinessLogicException(
                "An acuerdo must have at least one PRESTADOR and one RECEPTOR to be realizado",
                BusinessError.PRECONDITION_FAILED
            );

        const todosConfirmaron = acuerdo.participantes.every(p => p.idPerfil === perfilId || p.confirmoPrestacion);

        // La confirmación y la transferencia van en la misma transacción de BD:
        // si la transferencia falla, la confirmación tampoco queda guardada y se puede reintentar.
        await this.acuerdoRepository.manager.transaction(async manager => {
            await manager.update(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId, idPerfil: perfilId }, {
                confirmoPrestacion: true,
                fechaConfirmacion: new Date(),
            });
            if (todosConfirmaron)
                await this.transferirHoras(manager, acuerdoId);
        });

        return await this.findOne(acuerdoId);
    }

    // --- Transferencia de horas (RF-046 a RF-049) ---
    // Cada RECEPTOR paga las horas del acuerdo y cada PRESTADOR recibe las horas del acuerdo.
    // Se ejecuta dentro de la transacción de confirmarPrestacion: o se mueven todas las horas o ninguna.

    private async transferirHoras(manager: EntityManager, acuerdoId: string) {
        const acuerdo = await manager.findOne(AcuerdoEntity, {
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        for (const participante of acuerdo.participantes) {
            const perfil = await manager.findOne(PerfilMiembroEntity, { where: { id: participante.idPerfil } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

            const esReceptor = participante.rol === RolParticipante.RECEPTOR;
            const horas = esReceptor ? -acuerdo.horas : acuerdo.horas;
            const saldoResultante = perfil.saldo + horas;

            await manager.update(PerfilMiembroEntity, perfil.id, { saldo: saldoResultante });
            await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                tipo: esReceptor ? TipoTransaccion.SERVICIO_RECIBIDO : TipoTransaccion.SERVICIO_PRESTADO,
                horas,
                saldoResultante,
                perfil: { id: perfil.id },
                acuerdo: { id: acuerdo.id },
            }));
        }

        await manager.update(AcuerdoEntity, acuerdo.id, { estado: EstadoAcuerdo.REALIZADO });
    }

    // --- Saldo: un RECEPTOR debe tener al menos las horas del acuerdo al entrar (RF-043) ---

    private validarSaldoReceptor(perfil: PerfilMiembroEntity, horas: number) {
        if (perfil.saldo < horas)
            throw new BusinessLogicException("The perfil does not have enough saldo to be a RECEPTOR in the acuerdo", BusinessError.PRECONDITION_FAILED);
    }

    private async validarSaldoReceptores(acuerdoId: string, horas: number) {
        const receptores = await this.participanteRepository.find({
            where: { idAcuerdo: acuerdoId, rol: RolParticipante.RECEPTOR },
            relations: { perfil: true }
        });
        for (const receptor of receptores)
            this.validarSaldoReceptor(receptor.perfil, horas);
    }

    // --- Un acuerdo realizado (2) o cancelado (4) ya no se puede modificar ---

    private validarAcuerdoActivo(acuerdo: AcuerdoEntity) {
        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("The acuerdo is realizado and cannot be modified", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("The acuerdo is cancelado and cannot be modified", BusinessError.PRECONDITION_FAILED);
    }
}