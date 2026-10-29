/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/participante-acuerdo.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { AcuerdoEntity } from './acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

export enum RolParticipante {
    PRESTADOR = 'PRESTADOR',
    RECEPTOR = 'RECEPTOR',
}

@Entity()
export class ParticipanteAcuerdoEntity {
    @PrimaryColumn()
    idAcuerdo: string;

    @PrimaryColumn()
    idPerfil: string;

    // simple-enum funciona igual en Postgres y en SQLite (pruebas)
    @Column({ type: 'simple-enum', enum: RolParticipante })
    rol: RolParticipante;

    // --- Confirmación de que el servicio se prestó (RF-044, RF-045) ---
    @Column({ default: false })
    confirmoPrestacion: boolean;

    @Column({ nullable: true })
    fechaConfirmacion: Date;

    @ManyToOne(() => AcuerdoEntity, acuerdo => acuerdo.participantes, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.acuerdos)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}