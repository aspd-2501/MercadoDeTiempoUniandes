/* eslint-disable prettier/prettier */
/* archivo: src/chat/chat.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ChatEntity } from './chat.entity';
import { ChatParticipanteEntity } from './chat-participante.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(ChatEntity)
        private readonly chatRepository: Repository<ChatEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ChatParticipanteEntity)
        private readonly participanteRepository: Repository<ChatParticipanteEntity>
    ) {}

    // --- CRUD de Chat ---

    async findAll(): Promise<ChatEntity[]> {
        return await this.chatRepository.find({ relations: { participantes: true, mensajes: true } });
    }

    async findOne(id: string): Promise<ChatEntity> {
        const chat: ChatEntity | null = await this.chatRepository.findOne({
            where: { id },
            relations: { participantes: true, mensajes: true }
        });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);
        return chat;
    }

    async create(perfiles: PerfilMiembroEntity[]): Promise<ChatEntity> {
        if (!perfiles || perfiles.length < 2)
            throw new BusinessLogicException("A chat must have at least 2 participantes", BusinessError.PRECONDITION_FAILED);

        for (const p of perfiles) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: p.id } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
        }

        const chat = await this.chatRepository.save({});

        const participantes = perfiles.map(p =>
            this.participanteRepository.create({ idChat: chat.id, idPerfil: p.id })
        );
        await this.participanteRepository.save(participantes);

        const chatCompleto: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: chat.id },
            relations: { participantes: true }
        });
        return chatCompleto as ChatEntity;
    }

    async delete(id: string) {
        const chat: ChatEntity | null = await this.chatRepository.findOne({ where: { id } });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);
        await this.chatRepository.remove(chat);
    }

    // --- Relación con PerfilMiembro (vía ChatParticipante) ---

    async addPerfilChat(chatId: string, perfilId: string): Promise<ChatEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const chat: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: { participantes: true }
        });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);

        const yaParticipa = chat.participantes.some(p => p.idPerfil === perfilId);
        if (yaParticipa)
            throw new BusinessLogicException("The perfil is already a participant in the chat", BusinessError.PRECONDITION_FAILED);

        const participante = this.participanteRepository.create({ idChat: chatId, idPerfil: perfilId });
        await this.participanteRepository.save(participante);

        const chatActualizado: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: { participantes: true }
        });
        return chatActualizado as ChatEntity;
    }

    async findPerfilesByChatId(chatId: string): Promise<PerfilMiembroEntity[]> {
        const chat: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: { participantes: { perfil: true } }
        });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);

        return chat.participantes.map(p => p.perfil);
    }

    async deletePerfilChat(chatId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const chat: ChatEntity | null = await this.chatRepository.findOne({
            where: { id: chatId },
            relations: { participantes: true }
        });
        if (!chat)
            throw new BusinessLogicException("The chat with the given id was not found", BusinessError.NOT_FOUND);

        const participante = chat.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the chat", BusinessError.PRECONDITION_FAILED);

        if (chat.participantes.length <= 2)
            throw new BusinessLogicException("A chat must keep at least 2 participantes", BusinessError.PRECONDITION_FAILED);

        await this.participanteRepository.delete({ idChat: chatId, idPerfil: perfilId });
    }
}