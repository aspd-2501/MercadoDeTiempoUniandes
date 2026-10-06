/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/actividad-comunitaria.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { OrganizacionInstitucionalEntity } from '../organizacion-institucional/organizacion-institucional.entity';
import { InscripcionActividadEntity } from './inscripcion-actividad.entity';

@Entity()
export class ActividadComunitariaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @Column()
    imagen: string;

    @Column()
    cupo: number;

    @Column()
    cupoLleno: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => OrganizacionInstitucionalEntity, organizacion => organizacion.actividades)
    @JoinColumn({ name: 'idInstitucion' })
    organizacion: OrganizacionInstitucionalEntity;

    @OneToMany(() => InscripcionActividadEntity, i => i.actividad)
    inscritos: InscripcionActividadEntity[];
}