/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ReconocimientoOtorgadoEntity } from './reconocimiento-otorgado.entity';

@Entity()
export class ReconocimientoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column()
    requerimiento: string;

    @Column()
    icono: string;

    @OneToMany(() => ReconocimientoOtorgadoEntity, r => r.reconocimiento)
    otorgamientos: ReconocimientoOtorgadoEntity[];
}