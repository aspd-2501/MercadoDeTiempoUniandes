/* eslint-disable prettier/prettier */
/* archivo: src/chat/chat.entity.ts */
import { Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatParticipanteEntity } from './chat-participante.entity';
import { MensajeEntity } from '../mensaje/mensaje.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';

@Entity()
export class ChatEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // --- Participantes del chat (N:M vía ChatParticipante) ---
    @OneToMany(() => ChatParticipanteEntity, cp => cp.chat)
    participantes: ChatParticipanteEntity[];

    // --- Mensajes del chat (composición: si se borra el chat, se borran sus mensajes) ---
    @OneToMany(() => MensajeEntity, mensaje => mensaje.chat)
    mensajes: MensajeEntity[];

    // --- Acuerdo al que pertenece el chat (dueño de la relación: Acuerdo) ---
    @OneToOne(() => AcuerdoEntity, acuerdo => acuerdo.chat)
    acuerdo: AcuerdoEntity;
}