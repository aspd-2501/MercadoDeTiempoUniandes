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
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { ChatParticipanteEntity } from '../chat/chat-participante.entity';
import { calcularReparto, ParticipanteReparto, validarSaldosReceptores } from './reparto-horas';
import { bloquearPost, ocupacionPost, recalcularCupoPost, validarCupo } from './cupo-post';

export interface DatosInicioAcuerdo {
    postAyudaId?: string;
    solicitudId?: string;
    perfilId?: string;          // quien se une al post
    fechaRealizacion?: Date;    // opcional: se fija sola al coordinar el horario
    horas?: number;             // por defecto, las del post o la solicitud
}

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
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        return acuerdo;
    }

    async create(acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        if (!!acuerdo.postAyuda === !!acuerdo.solicitud)
            throw new BusinessLogicException("Un acuerdo debe venir de un post de ayuda o de una solicitud, pero no de ambos", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("Un acuerdo queda realizado solo cuando todos los participantes confirman la prestación", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("Un acuerdo no se puede crear cancelado", BusinessError.PRECONDITION_FAILED);

        acuerdo.estado = acuerdo.estado ?? EstadoAcuerdo.EN_CREACION;
        return await this.acuerdoRepository.save(acuerdo);
    }

    // --- Iniciar un acuerdo en una sola operación (todo o nada) ---
    // Crea el acuerdo, agrega sus dos primeros participantes con su rol y crea su chat con ambos.
    // Todo ocurre en una transacción: si algo falla, no queda nada creado.
    //  - Desde un post: el autor y quien se une. Si el post ofrece ayuda, el autor es PRESTADOR y quien se une
    //    RECEPTOR; si el post pide ayuda, al revés.
    //  - Desde una solicitud: la organización prestadora es PRESTADOR y el autor de la solicitud RECEPTOR.
    async iniciar(datos: DatosInicioAcuerdo): Promise<AcuerdoEntity> {
        if (!!datos.postAyudaId === !!datos.solicitudId)
            throw new BusinessLogicException("Un acuerdo debe venir de un post de ayuda o de una solicitud, pero no de ambos", BusinessError.PRECONDITION_FAILED);

        const acuerdoId = await this.acuerdoRepository.manager.transaction(async manager => {
            let horas: number;
            let prestador: PerfilMiembroEntity;
            let receptor: PerfilMiembroEntity;
            const origen: Partial<AcuerdoEntity> = {};

            if (datos.postAyudaId) {
                await bloquearPost(manager, datos.postAyudaId);
                const ocupacion = await ocupacionPost(manager, datos.postAyudaId);
                const post = ocupacion.post;
                if (!datos.perfilId)
                    throw new BusinessLogicException("Debes indicar el perfil que se une al post", BusinessError.BAD_REQUEST);

                const miembro = await manager.findOne(PerfilMiembroEntity, { where: { id: datos.perfilId } });
                if (!miembro)
                    throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);
                if (miembro.id === post.perfilAutor.id)
                    throw new BusinessLogicException("No puedes unirte a tu propio post", BusinessError.PRECONDITION_FAILED);
                // No puede unirse dos veces al mismo post, ni pasar del cupo
                validarCupo(ocupacion, [miembro.id]);

                [prestador, receptor] = post.ofrece ? [post.perfilAutor, miembro] : [miembro, post.perfilAutor];
                horas = datos.horas ?? post.horas;
                origen.postAyuda = { id: post.id } as PostAyudaEntity;
            } else {
                const solicitud = await manager.findOne(SolicitudAyudaEntity, {
                    where: { id: datos.solicitudId },
                    relations: { perfilAutor: true, prestador: { perfil: true }, acuerdo: true }
                });
                if (!solicitud)
                    throw new BusinessLogicException("No se encontró la solicitud", BusinessError.NOT_FOUND);
                if (solicitud.acuerdo)
                    throw new BusinessLogicException("La solicitud ya tiene un acuerdo", BusinessError.PRECONDITION_FAILED);

                prestador = solicitud.prestador.perfil;
                receptor = solicitud.perfilAutor;
                horas = datos.horas ?? solicitud.horas;
                origen.solicitud = { id: solicitud.id } as SolicitudAyudaEntity;
            }

            // El receptor debe poder pagar el acuerdo
            validarSaldosReceptores(horas, [
                { idPerfil: prestador.id, rol: RolParticipante.PRESTADOR, saldo: prestador.saldo },
                { idPerfil: receptor.id, rol: RolParticipante.RECEPTOR, saldo: receptor.saldo },
            ]);

            const chat = await manager.save(ChatEntity, manager.create(ChatEntity, {}));
            await manager.save(ChatParticipanteEntity, [
                manager.create(ChatParticipanteEntity, { idChat: chat.id, idPerfil: prestador.id }),
                manager.create(ChatParticipanteEntity, { idChat: chat.id, idPerfil: receptor.id }),
            ]);

            const acuerdo = await manager.save(AcuerdoEntity, manager.create(AcuerdoEntity, {
                ...origen,
                horas,
                fechaCreacion: new Date(),
                fechaRealizacion: datos.fechaRealizacion ?? null,
                estado: EstadoAcuerdo.EN_CREACION,
                chat,
            }));

            await manager.save(ParticipanteAcuerdoEntity, [
                manager.create(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdo.id, idPerfil: prestador.id, rol: RolParticipante.PRESTADOR }),
                manager.create(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdo.id, idPerfil: receptor.id, rol: RolParticipante.RECEPTOR }),
            ]);

            if (origen.postAyuda)
                await recalcularCupoPost(manager, origen.postAyuda.id);

            return acuerdo.id;
        });

        return await this.findOne(acuerdoId);
    }

    async update(id: string, acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        const persisted: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);

        this.validarAcuerdoActivo(persisted);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("Un acuerdo queda realizado solo cuando todos los participantes confirman la prestación", BusinessError.PRECONDITION_FAILED);

        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("Un acuerdo solo se puede cancelar con una solicitud de cancelación", BusinessError.PRECONDITION_FAILED);

        // Si cambian las horas, todos los receptores deben poder pagar su nueva cuota
        if (acuerdo.horas != null && acuerdo.horas !== persisted.horas)
            validarSaldosReceptores(acuerdo.horas, await this.participantesConSaldo(id));

        acuerdo.estado = acuerdo.estado ?? persisted.estado;

        acuerdo.id = id;
        return await this.acuerdoRepository.save(acuerdo);
    }

    async delete(id: string) {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id }, relations: { postAyuda: true } });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        const postId = acuerdo.postAyuda?.id;
        await this.acuerdoRepository.manager.transaction(async manager => {
            await manager.remove(acuerdo);
            if (postId) await recalcularCupoPost(manager, postId);   // se libera el cupo
        });
    }

    // --- Relación con PerfilMiembro (vía ParticipanteAcuerdo, con rol) ---

    async addParticipanteAcuerdo(acuerdoId: string, perfilId: string, rol: RolParticipante): Promise<AcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true, postAyuda: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const yaParticipa = acuerdo.participantes.some(p => p.idPerfil === perfilId);
        if (yaParticipa)
            throw new BusinessLogicException("El perfil ya es participante del acuerdo", BusinessError.PRECONDITION_FAILED);

        // Un receptor nuevo o un prestador nuevo cambian las cuotas: todos deben poder pagar
        const actuales = await this.participantesConSaldo(acuerdoId);
        validarSaldosReceptores(acuerdo.horas, [...actuales, { idPerfil: perfilId, rol, saldo: perfil.saldo }]);

        const postId = acuerdo.postAyuda?.id;
        await this.acuerdoRepository.manager.transaction(async manager => {
            if (postId) {
                // Si el acuerdo viene de un post: no puede estar en otro acuerdo del post ni pasar del cupo
                await bloquearPost(manager, postId);
                validarCupo(await ocupacionPost(manager, postId), [perfilId]);
            }
            await manager.save(ParticipanteAcuerdoEntity, manager.create(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId, idPerfil: perfilId, rol }));
            if (postId) await recalcularCupoPost(manager, postId);
        });

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async findParticipanteByAcuerdoIdPerfilId(acuerdoId: string, perfilId: string): Promise<ParticipanteAcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("El perfil no es participante del acuerdo", BusinessError.PRECONDITION_FAILED);

        return participante;
    }

    async findParticipantesByAcuerdoId(acuerdoId: string): Promise<ParticipanteAcuerdoEntity[]> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: { perfil: true } }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);

        return acuerdo.participantes;
    }

    async associateParticipantesAcuerdo(
        acuerdoId: string,
        participantes: { perfilId: string; rol: RolParticipante }[]
    ): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true, postAyuda: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const ids = participantes.map(p => p.perfilId);
        if (new Set(ids).size !== ids.length)
            throw new BusinessLogicException("Un perfil no puede estar dos veces en el mismo acuerdo", BusinessError.PRECONDITION_FAILED);

        const nuevos: ParticipanteReparto[] = [];
        for (const p of participantes) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: p.perfilId } });
            if (!perfil)
                throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);
            nuevos.push({ idPerfil: perfil.id, rol: p.rol, saldo: perfil.saldo });
        }
        validarSaldosReceptores(acuerdo.horas, nuevos);

        const postId = acuerdo.postAyuda?.id;
        await this.acuerdoRepository.manager.transaction(async manager => {
            if (postId) {
                // Los cupos se cuentan sin los participantes actuales de este acuerdo (se reemplazan)
                await bloquearPost(manager, postId);
                validarCupo(await ocupacionPost(manager, postId, acuerdoId), ids);
            }
            await manager.delete(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId });
            await manager.save(ParticipanteAcuerdoEntity, participantes.map(p =>
                manager.create(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId, idPerfil: p.perfilId, rol: p.rol })
            ));
            if (postId) await recalcularCupoPost(manager, postId);
        });

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async deleteParticipanteAcuerdo(acuerdoId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true, postAyuda: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("El perfil no es participante del acuerdo", BusinessError.PRECONDITION_FAILED);

        await this.acuerdoRepository.manager.transaction(async manager => {
            await manager.delete(ParticipanteAcuerdoEntity, { idAcuerdo: acuerdoId, idPerfil: perfilId });
            if (acuerdo.postAyuda) await recalcularCupoPost(manager, acuerdo.postAyuda.id);   // se libera el cupo
        });
    }

    // --- Horario acordado: debe ser uno de los horarios propuestos para el acuerdo, su post o su solicitud ---

    async setHorarioAcordado(acuerdoId: string, horarioId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { postAyuda: true, solicitud: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({
            where: { id: horarioId },
            relations: { acuerdo: true, postAyuda: true, solicitud: true }
        });
        if (!horario)
            throw new BusinessLogicException("No se encontró el horario disponible", BusinessError.NOT_FOUND);

        const perteneceAlAcuerdo =
            horario.acuerdo?.id === acuerdo.id ||
            (!!acuerdo.postAyuda && horario.postAyuda?.id === acuerdo.postAyuda.id) ||
            (!!acuerdo.solicitud && horario.solicitud?.id === acuerdo.solicitud.id);
        if (!perteneceAlAcuerdo)
            throw new BusinessLogicException("El horario disponible no pertenece al acuerdo", BusinessError.PRECONDITION_FAILED);

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
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);

        const chat: ChatEntity | null = await this.chatRepository.findOne({ where: { id: chatId }, relations: { acuerdo: true } });
        if (!chat)
            throw new BusinessLogicException("No se encontró el chat", BusinessError.NOT_FOUND);
        if (chat.acuerdo && chat.acuerdo.id !== acuerdoId)
            throw new BusinessLogicException("El chat ya pertenece a otro acuerdo", BusinessError.PRECONDITION_FAILED);

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
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);
        this.validarAcuerdoActivo(acuerdo);

        if (acuerdo.estado !== EstadoAcuerdo.ACORDADO)
            throw new BusinessLogicException("El acuerdo debe estar acordado para confirmar la prestación", BusinessError.PRECONDITION_FAILED);

        if (!acuerdo.fechaRealizacion)
            throw new BusinessLogicException("El acuerdo todavía no tiene fecha de realización", BusinessError.PRECONDITION_FAILED);

        if (new Date(acuerdo.fechaRealizacion).getTime() > Date.now())
            throw new BusinessLogicException("La prestación no se puede confirmar antes de la fecha de realización", BusinessError.PRECONDITION_FAILED);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("El perfil no es participante del acuerdo", BusinessError.PRECONDITION_FAILED);

        if (participante.confirmoPrestacion)
            throw new BusinessLogicException("El perfil ya confirmó la prestación", BusinessError.PRECONDITION_FAILED);

        const tienePrestador = acuerdo.participantes.some(p => p.rol === RolParticipante.PRESTADOR);
        const tieneReceptor = acuerdo.participantes.some(p => p.rol === RolParticipante.RECEPTOR);
        if (!tienePrestador || !tieneReceptor)
            throw new BusinessLogicException(
                "Un acuerdo debe tener al menos un prestador y un receptor para quedar realizado",
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
    // Las cuotas salen de calcularReparto (reparto-horas.ts). Lo que sobra va al fondo comunitario.
    // Se ejecuta dentro de la transacción de confirmarPrestacion: o se mueven todas las horas o ninguna.

    private async transferirHoras(manager: EntityManager, acuerdoId: string) {
        const acuerdo = await manager.findOne(AcuerdoEntity, {
            where: { id: acuerdoId },
            relations: { participantes: { perfil: true } }
        });
        if (!acuerdo)
            throw new BusinessLogicException("No se encontró el acuerdo", BusinessError.NOT_FOUND);

        const reparto = calcularReparto(acuerdo.horas, acuerdo.participantes.map(p => ({
            idPerfil: p.idPerfil, rol: p.rol, saldo: p.perfil.saldo,
        })));

        for (const participante of acuerdo.participantes) {
            const esReceptor = participante.rol === RolParticipante.RECEPTOR;
            const horas = esReceptor ? -(reparto.cuotas.get(participante.idPerfil) ?? 0) : reparto.pagoPrestador;
            const saldoResultante = participante.perfil.saldo + horas;

            await manager.update(PerfilMiembroEntity, participante.idPerfil, { saldo: saldoResultante });
            await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                tipo: esReceptor ? TipoTransaccion.SERVICIO_RECIBIDO : TipoTransaccion.SERVICIO_PRESTADO,
                horas,
                saldoResultante,
                perfil: { id: participante.idPerfil },
                acuerdo: { id: acuerdo.id },
            }));
        }

        if (reparto.aporteFondo > 0) {
            const fondo = await this.obtenerFondoComunitario(manager);
            const saldoResultante = fondo.saldo + reparto.aporteFondo;

            await manager.update(DepositoHorasEntity, fondo.id, { saldo: saldoResultante });
            await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                tipo: TipoTransaccion.APORTE_FONDO,
                horas: reparto.aporteFondo,
                saldoResultante,
                deposito: { id: fondo.id },
                acuerdo: { id: acuerdo.id },
            }));
        }

        await manager.update(AcuerdoEntity, acuerdo.id, { estado: EstadoAcuerdo.REALIZADO });
    }

    // --- Fondo comunitario: el único DepositoHoras (se crea con saldo 0 si aún no existe) ---

    private async obtenerFondoComunitario(manager: EntityManager): Promise<DepositoHorasEntity> {
        const depositos = await manager.find(DepositoHorasEntity);
        if (depositos.length > 1)
            throw new BusinessLogicException("Debe haber exactamente un depósito de horas: el fondo comunitario", BusinessError.PRECONDITION_FAILED);
        if (depositos.length === 1)
            return depositos[0];
        return await manager.save(DepositoHorasEntity, manager.create(DepositoHorasEntity, { saldo: 0 }));
    }

    // --- Participantes actuales con su saldo, para validar cuotas (RF-043) ---

    private async participantesConSaldo(acuerdoId: string): Promise<ParticipanteReparto[]> {
        const participantes = await this.participanteRepository.find({
            where: { idAcuerdo: acuerdoId },
            relations: { perfil: true }
        });
        return participantes.map(p => ({ idPerfil: p.idPerfil, rol: p.rol, saldo: p.perfil.saldo }));
    }

    // --- Un acuerdo realizado (2) o cancelado (4) ya no se puede modificar ---

    private validarAcuerdoActivo(acuerdo: AcuerdoEntity) {
        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("El acuerdo ya se realizó y no se puede modificar", BusinessError.PRECONDITION_FAILED);
        if (acuerdo.estado === EstadoAcuerdo.CANCELADO)
            throw new BusinessLogicException("El acuerdo está cancelado y no se puede modificar", BusinessError.PRECONDITION_FAILED);
    }
}