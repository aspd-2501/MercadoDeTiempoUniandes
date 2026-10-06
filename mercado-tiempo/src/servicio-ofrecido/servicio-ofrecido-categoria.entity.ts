/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido-categoria.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Entity()
export class ServicioOfrecidoCategoriaEntity {
    @PrimaryColumn()
    idServicio: string;

    @PrimaryColumn()
    idCategoria: string;

    @ManyToOne(() => ServicioOfrecidoEntity, servicio => servicio.categorias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idServicio' })
    servicio: ServicioOfrecidoEntity;

    @ManyToOne(() => CategoriaEntity, categoria => categoria.serviciosOfrecidos)
    @JoinColumn({ name: 'idCategoria' })
    categoria: CategoriaEntity;
}