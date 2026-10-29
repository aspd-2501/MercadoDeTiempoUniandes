/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.entity.ts */
import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { TipoTransaccion } from './tipo-transaccion.enum';

// --- Un movimiento de horas en la cuenta de un miembro o del fondo comunitario (RF-046, RF-049, RF-056) ---
@Entity()
@Check(`"tipo" IN ('SERVICIO_RECIBIDO', 'SERVICIO_PRESTADO', 'APORTE_FONDO')`)
@Check(`
    (CASE WHEN "idPerfil" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "idDeposito" IS NOT NULL THEN 1 ELSE 0 END) = 1
`)
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

    // Saldo de la cuenta justo después del movimiento
    @Column()
    saldoResultante: number;

    // --- Cuenta que se mueve: un miembro o el fondo comunitario (exactamente una, validado por CHECK) ---
    @ManyToOne(() => PerfilMiembroEntity, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    @ManyToOne(() => DepositoHorasEntity, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idDeposito' })
    deposito: DepositoHorasEntity;

    // --- Acuerdo que originó el movimiento (RF-049) ---
    @ManyToOne(() => AcuerdoEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;
}
