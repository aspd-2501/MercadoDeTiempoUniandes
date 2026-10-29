/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.entity.ts */
import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { TipoTransaccion } from './tipo-transaccion.enum';

// --- Un movimiento de horas en la cuenta de un miembro (RF-046, RF-049, RF-056) ---
@Entity()
@Check(`"tipo" IN ('SERVICIO_RECIBIDO', 'SERVICIO_PRESTADO')`)
export class TransaccionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn()
    fecha: Date;

    @Column({ type: 'varchar' })
    tipo: TipoTransaccion;

    // Positivo si suma horas al saldo, negativo si las descuenta
    @Column()
    horas: number;

    // Saldo del miembro justo después del movimiento
    @Column()
    saldoResultante: number;

    // --- Miembro cuya cuenta se mueve ---
    @ManyToOne(() => PerfilMiembroEntity, { nullable: false, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    // --- Acuerdo que originó el movimiento (RF-049) ---
    @ManyToOne(() => AcuerdoEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;
}
