/* eslint-disable prettier/prettier */
/* archivo: src/chat/chat-participante.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ChatEntity } from './chat.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
export class ChatParticipanteEntity {
    @PrimaryColumn()
    idChat: string;

    @PrimaryColumn()
    idPerfil: string;

    @ManyToOne(() => ChatEntity, chat => chat.participantes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idChat' })
    chat: ChatEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.chats)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}