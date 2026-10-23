/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';

@Entity()
@Check(`"estado" IN (0, 1, 2, 3)`)
export class SolicitudModificacionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    horas: number;

    @Column()
    fechaCreacion: Date;

    @Column()
    fechaRealizacion: Date;

    // 0: en creación, 1: acordado, 2: realizado, 3: en modificación
    @Column({ type: 'int', default: EstadoAcuerdo.EN_CREACION })
    estado: EstadoAcuerdo;

    // --- Acuerdo que se quiere modificar (si se borra el acuerdo, se borran sus solicitudes) ---
    @ManyToOne(() => AcuerdoEntity, acuerdo => acuerdo.solicitudesModificacion, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;
}
