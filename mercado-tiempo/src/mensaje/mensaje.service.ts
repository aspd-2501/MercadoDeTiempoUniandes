/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { MensajeEntity } from './mensaje.entity';
import { ChatEntity } from '../chat/chat.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class MensajeService {
    constructor(
        @InjectRepository(MensajeEntity)
        private readonly mensajeRepository: Repository<MensajeEntity>,

        @InjectRepository(ChatEntity)
        private readonly chatRepository: Repository<ChatEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>
    ) {}

    async findAll(): Promise<MensajeEntity[]> {
        return await this.mensajeRepository.find({ relations: { chat: true, emisor: true } });
    }

    async findOne(id: string): Promise<MensajeEntity> {
        const mensaje: MensajeEntity | null = await this.mensajeRepository.findOne({
            where: { id },
            relations: { chat: true, emisor: true }
        });
        if (!mensaje)
            throw new BusinessLogicException("The mensaje with the given id was not found", BusinessError.NOT_FOUND);
        return mensaje;
    }

    async findByChatId(chatId: string): Promise<MensajeEntity[]> {
        const chat: ChatEntity | null = await this.chatRepository.findOne({ where: { id: chatId } });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);

        return await this.mensajeRepository.find({
            where: { chat: { id: chatId } },
            relations: { emisor: true }
        });
    }

    async create(mensaje: MensajeEntity): Promise<MensajeEntity> {
        if (!mensaje.emisor)
            throw new BusinessLogicException("A mensaje must have an emisor", BusinessError.PRECONDITION_FAILED);
        const emisor = await this.perfilMiembroRepository.findOne({ where: { id: mensaje.emisor.id } });
        if (!emisor)
            throw new BusinessLogicException("The perfil emisor with the given id was not found", BusinessError.NOT_FOUND);

        if (!mensaje.chat)
            throw new BusinessLogicException("A mensaje must belong to a chat", BusinessError.PRECONDITION_FAILED);
        const chat: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: mensaje.chat.id },
            relations: { participantes: true }
        });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);

        const esParticipante = chat.participantes.some(p => p.idPerfil === mensaje.emisor.id);
        if (!esParticipante)
            throw new BusinessLogicException("The emisor is not a participant in the chat", BusinessError.PRECONDITION_FAILED);

        if (!mensaje.contenido || mensaje.contenido.trim().length === 0)
            throw new BusinessLogicException("A mensaje cannot have empty contenido", BusinessError.PRECONDITION_FAILED);

        return await this.mensajeRepository.save(mensaje);
    }

    async delete(id: string) {
        const mensaje: MensajeEntity | null = await this.mensajeRepository.findOne({ where: { id } });
        if (!mensaje)
            throw new BusinessLogicException("The mensaje with the given id was not found", BusinessError.NOT_FOUND);
        await this.mensajeRepository.remove(mensaje);
    }
}