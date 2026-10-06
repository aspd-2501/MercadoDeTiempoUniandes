/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.entity.ts */
import { Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioEntity } from '../usuario/usuario.entity';

@Entity()
export class ModeradorEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // --- Subtipo de Usuario (1 a 1, Moderador es dueño) ---
    @OneToOne(() => UsuarioEntity, usuario => usuario.moderador)
    @JoinColumn({ name: 'idUniandes' })
    usuario: UsuarioEntity;
}