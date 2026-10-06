/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/inscripcion-actividad.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { ActividadComunitariaEntity } from './actividad-comunitaria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
export class InscripcionActividadEntity {
    @PrimaryColumn()
    idActividad: string;

    @PrimaryColumn()
    idPerfil: string;

    @ManyToOne(() => ActividadComunitariaEntity, actividad => actividad.inscritos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idActividad' })
    actividad: ActividadComunitariaEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.actividadesInscritas)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}