/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ChatEntity } from '../chat/chat.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
export class MensajeEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fecha: Date;

    @Column()
    contenido: string;

    // --- Chat al que pertenece (CASCADE: si se borra el chat, se borran sus mensajes) ---
    @ManyToOne(() => ChatEntity, chat => chat.mensajes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idChat' })
    chat: ChatEntity;

    // --- Emisor del mensaje ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.mensajes)
    @JoinColumn({ name: 'idPerfil' })
    emisor: PerfilMiembroEntity;
}