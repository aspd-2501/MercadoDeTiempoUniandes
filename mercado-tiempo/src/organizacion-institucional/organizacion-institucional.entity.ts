/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ActividadComunitariaEntity } from '../actividad-comunitaria/actividad-comunitaria.entity';

@Entity()
export class OrganizacionInstitucionalEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column()
    imagen: string;

    @OneToMany(() => ActividadComunitariaEntity, actividad => actividad.organizacion)
    actividades: ActividadComunitariaEntity[];
}