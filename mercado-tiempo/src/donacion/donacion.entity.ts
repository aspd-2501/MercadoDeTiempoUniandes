/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';

@Entity()
@Check(`("idPerfilDonante" IS NOT NULL)::int + ("idDepositoDonante" IS NOT NULL)::int = 1`)
@Check(`("idPerfilReceptor" IS NOT NULL)::int + ("idDepositoReceptor" IS NOT NULL)::int = 1`)
@Check(`"idPerfilDonante" IS NULL OR "idPerfilDonante" <> "idPerfilReceptor"`)
@Check(`"idDepositoDonante" IS NULL OR "idDepositoDonante" <> "idDepositoReceptor"`)
export class DonacionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    horasDonadas: number;

    @Column()
    fechaDonacion: Date;

    @Column()
    mensaje: string;

    // --- Donante: perfil o depósito (exactamente uno, validado por CHECK) ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.donacionesHechas, { nullable: true })
    @JoinColumn({ name: 'idPerfilDonante' })
    perfilDonante: PerfilMiembroEntity;

    @ManyToOne(() => DepositoHorasEntity, deposito => deposito.donacionesComoDonante, { nullable: true })
    @JoinColumn({ name: 'idDepositoDonante' })
    depositoDonante: DepositoHorasEntity;

    // --- Receptor: perfil o depósito (exactamente uno, validado por CHECK) ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.donacionesRecibidas, { nullable: true })
    @JoinColumn({ name: 'idPerfilReceptor' })
    perfilReceptor: PerfilMiembroEntity;

    @ManyToOne(() => DepositoHorasEntity, deposito => deposito.donacionesComoReceptor, { nullable: true })
    @JoinColumn({ name: 'idDepositoReceptor' })
    depositoReceptor: DepositoHorasEntity;
}