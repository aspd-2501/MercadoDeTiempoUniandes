/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioPostEntity } from './usuario-post.entity';
import { ReconocimientoOtorgadoEntity } from '../reconocimiento/reconocimiento-otorgado.entity';

@Entity()
export class PostComunitarioEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @Column()
    fechaCreacion: Date;

    @Column()
    imagen: string;

    @Column()
    likes: number;

    // --- Participantes del post (N:M vía UsuarioPost, mínimo 2) ---
    @OneToMany(() => UsuarioPostEntity, up => up.post)
    participantes: UsuarioPostEntity[];

    // --- Reconocimientos otorgados dentro de este post (opcional) ---
    @OneToMany(() => ReconocimientoOtorgadoEntity, r => r.postComunitario)
    reconocimientos: ReconocimientoOtorgadoEntity[];
}