/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
@Check(`
    ("idAcuerdo" IS NOT NULL)::int +
    ("idSolicitud" IS NOT NULL)::int +
    ("idPostAyuda" IS NOT NULL)::int = 1
`)
export class HorarioDisponibleEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fechaInicio: Date;

    @Column()
    fechaFin: Date;

    // --- Origen: acuerdo, solicitud o post (exactamente uno, validado por CHECK) ---
    @OneToOne(() => AcuerdoEntity, acuerdo => acuerdo.horario, { nullable: true })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;

    @OneToOne(() => SolicitudAyudaEntity, solicitud => solicitud.horario, { nullable: true })
    @JoinColumn({ name: 'idSolicitud' })
    solicitud: SolicitudAyudaEntity;

    @OneToOne(() => PostAyudaEntity, post => post.horario, { nullable: true })
    @JoinColumn({ name: 'idPostAyuda' })
    postAyuda: PostAyudaEntity;

    // --- Perfil que propone el horario ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.horariosDisponibles)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}