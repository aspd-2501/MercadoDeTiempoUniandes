/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.entity.ts */
import { Check, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { ParticipanteAcuerdoEntity } from './participante-acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';

@Entity()
@Check(`("idPostAyuda" IS NOT NULL)::int + ("idSolicitud" IS NOT NULL)::int = 1`)
export class AcuerdoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    horas: number;

    @Column()
    fechaCreacion: Date;

    @Column()
    fechaRealizacion: Date;

    @Column()
    finalizado: boolean;

    // --- Origen: post o solicitud (exactamente uno, validado por CHECK) ---
    @OneToOne(() => PostAyudaEntity, post => post.acuerdo, { nullable: true })
    @JoinColumn({ name: 'idPostAyuda' })
    postAyuda: PostAyudaEntity;

    @OneToOne(() => SolicitudAyudaEntity, solicitud => solicitud.acuerdo, { nullable: true })
    @JoinColumn({ name: 'idSolicitud' })
    solicitud: SolicitudAyudaEntity;

    // --- Participantes (N:M con atributo "rol") ---
    @OneToMany(() => ParticipanteAcuerdoEntity, participante => participante.acuerdo)
    participantes: ParticipanteAcuerdoEntity[];

    // --- Horario acordado (opcional) ---
    @OneToOne(() => HorarioDisponibleEntity, horario => horario.acuerdo)
    horario: HorarioDisponibleEntity;
}