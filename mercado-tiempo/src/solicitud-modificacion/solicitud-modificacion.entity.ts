/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AprobacionModificacionEntity } from './aprobacion-modificacion.entity';
import { EstadoSolicitudModificacion, TipoSolicitudModificacion } from './estado-solicitud-modificacion.enum';

@Entity()
@Check(`"estado" IN (0, 1, 2, 3)`)
@Check(`"tipo" IN ('MODIFICACION', 'CANCELACION')`)
export class SolicitudModificacionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // MODIFICACION o CANCELACION
    @Column({ type: 'varchar' })
    tipo: TipoSolicitudModificacion;

    // Nuevos valores propuestos (solo para MODIFICACION)
    @Column({ type: 'int', nullable: true })
    horas: number | null;

    @Column({ nullable: true })
    fechaRealizacion: Date;

    @Column()
    fechaCreacion: Date;

    // 0: pendiente, 1: aprobada, 2: rechazada, 3: retirada
    @Column({ type: 'int', default: EstadoSolicitudModificacion.PENDIENTE })
    estado: EstadoSolicitudModificacion;

    // Estado que tenía el acuerdo antes de la propuesta, para restaurarlo si no se aplica (RF-041)
    @Column({ type: 'int' })
    estadoAcuerdoAnterior: EstadoAcuerdo;

    // --- Acuerdo sobre el que se hace la propuesta ---
    @ManyToOne(() => AcuerdoEntity, acuerdo => acuerdo.solicitudesModificacion, { onDelete: 'CASCADE', nullable: false })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;

    // --- Participante que hizo la propuesta ---
    @ManyToOne(() => PerfilMiembroEntity, { nullable: false })
    @JoinColumn({ name: 'idSolicitante' })
    solicitante: PerfilMiembroEntity;

    // --- Aprobaciones registradas (una por participante) ---
    @OneToMany(() => AprobacionModificacionEntity, a => a.solicitud)
    aprobaciones: AprobacionModificacionEntity[];
}
