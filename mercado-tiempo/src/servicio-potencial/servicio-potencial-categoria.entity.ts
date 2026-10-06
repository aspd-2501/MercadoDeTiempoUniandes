/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial-categoria.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ServicioPotencialEntity } from './servicio-potencial.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Entity()
export class ServicioPotencialCategoriaEntity {
    @PrimaryColumn()
    idServicioPotencial: string;

    @PrimaryColumn()
    idCategoria: string;

    @ManyToOne(() => ServicioPotencialEntity, servicio => servicio.categorias, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idServicioPotencial' })
    servicio: ServicioPotencialEntity;

    @ManyToOne(() => CategoriaEntity, categoria => categoria.serviciosPotenciales)
    @JoinColumn({ name: 'idCategoria' })
    categoria: CategoriaEntity;
}