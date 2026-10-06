/* eslint-disable prettier/prettier */
/* archivo: src/post-de-ayuda/post-ayuda-categoria.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PostAyudaEntity } from './post-ayuda.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Entity()
export class PostAyudaCategoriaEntity {
    @PrimaryColumn()
    idPostAyuda: string;

    @PrimaryColumn()
    idCategoria: string;

    @ManyToOne(() => PostAyudaEntity, post => post.categorias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPostAyuda' })
    post: PostAyudaEntity;

    @ManyToOne(() => CategoriaEntity, categoria => categoria.postsDeAyuda)
    @JoinColumn({ name: 'idCategoria' })
    categoria: CategoriaEntity;
}