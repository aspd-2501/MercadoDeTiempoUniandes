/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { ChatEntity } from '../chat/chat.entity';

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
            throw new BusinessLogicException("Use finalizarAcuerdo to mark an acuerdo as realizado", BusinessError.PRECONDITION_FAILED);

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
            throw new BusinessLogicException("Use finalizarAcuerdo to mark an acuerdo as realizado", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("An acuerdo can only be cancelado through a solicitud de cancelacion", BusinessError.PRECONDITION_FAILED);

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

    // --- Finalización (estado 2: realizado): exige al menos 1 PRESTADOR y 1 RECEPTOR ---

    async finalizarAcuerdo(id: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("The acuerdo is already realizado", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("The acuerdo is cancelado and cannot be modified", BusinessError.PRECONDITION_FAILED);

        const tienePrestador = acuerdo.participantes.some(p => p.rol === RolParticipante.PRESTADOR);
        const tieneReceptor = acuerdo.participantes.some(p => p.rol === RolParticipante.RECEPTOR);

        if (!tienePrestador || !tieneReceptor)
            throw new BusinessLogicException(
                "An acuerdo must have at least one PRESTADOR and one RECEPTOR to be realizado",
                BusinessError.PRECONDITION_FAILED
            );

        acuerdo.estado = EstadoAcuerdo.REALIZADO;
        return await this.acuerdoRepository.save(acuerdo);
    }

    // --- Un acuerdo realizado (2) o cancelado (4) ya no se puede modificar ---

    private validarAcuerdoActivo(acuerdo: AcuerdoEntity) {
        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("The acuerdo is realizado and cannot be modified", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("The acuerdo is cancelado and cannot be modified", BusinessError.PRECONDITION_FAILED);
    }
}