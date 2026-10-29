/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ActividadComunitariaEntity } from '../actividad-comunitaria/actividad-comunitaria.entity';

@Entity()
@Check(`
    (CASE WHEN "idAcuerdo" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "idSolicitud" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "idPostAyuda" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "idActividad" IS NOT NULL THEN 1 ELSE 0 END) = 1
`)
export class HorarioDisponibleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fechaInicio: Date;

    @Column()
    fechaFin: Date;

    // --- Origen: acuerdo, solicitud, post o actividad (exactamente uno, validado por CHECK) ---
    // Un acuerdo puede tener varios horarios propuestos (horariosDisponibles)
    @ManyToOne(() => AcuerdoEntity, acuerdo => acuerdo.horariosDisponibles, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;

    @OneToOne(() => SolicitudAyudaEntity, solicitud => solicitud.horario, { nullable: true })
    @JoinColumn({ name: 'idSolicitud' })
    solicitud: SolicitudAyudaEntity;

    // Un post de ayuda puede proponer varias franjas (horariosDisponibles)
    @ManyToOne(() => PostAyudaEntity, post => post.horariosDisponibles, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPostAyuda' })
    postAyuda: PostAyudaEntity;

    // --- Fecha(s) de evento de una actividad comunitaria ---
    @ManyToOne(() => ActividadComunitariaEntity, actividad => actividad.fechaEvento, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idActividad' })
    actividad: ActividadComunitariaEntity;

    // --- Perfil que propone el horario ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.horariosDisponibles)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}