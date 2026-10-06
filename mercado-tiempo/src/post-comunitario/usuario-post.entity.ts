/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/usuario-post.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
export class UsuarioPostEntity {
    @PrimaryColumn()
    idPostComunitario: string;

    @PrimaryColumn()
    idPerfil: string;

    @ManyToOne(() => PostComunitarioEntity, post => post.participantes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPostComunitario' })
    post: PostComunitarioEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.postsComunitarios)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}