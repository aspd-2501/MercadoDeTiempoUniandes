/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { DonacionEntity } from '../donacion/donacion.entity';

@Entity()
export class DepositoHorasEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    saldo: number;

    // --- Lado inverso de las relaciones en DonacionEntity ---
    @OneToMany(() => DonacionEntity, donacion => donacion.depositoDonante)
    donacionesComoDonante: DonacionEntity[];

    @OneToMany(() => DonacionEntity, donacion => donacion.depositoReceptor)
    donacionesComoReceptor: DonacionEntity[];
}