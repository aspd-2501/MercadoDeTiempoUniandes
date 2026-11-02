/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.entity.ts */
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { DonacionEntity } from '../donacion/donacion.entity';

@Entity()
export class CausaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @Column()
    descripcion: string;

    @Column()
    imagen: string;

    // Se llena sola al crear la causa; sirve para ordenarla en el feed (RF-019)
    @CreateDateColumn()
    fechaCreacion: Date;

    // --- Creador y receptor (ambos obligatorios, pueden ser el mismo perfil) ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.causasCreadas)
    @JoinColumn({ name: 'idPerfilCreador' })
    perfilCreador: PerfilMiembroEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.causasRecibidas)
    @JoinColumn({ name: 'idPerfilReceptor' })
    perfilReceptor: PerfilMiembroEntity;

    // --- Donaciones hechas a esta causa ---
    @OneToMany(() => DonacionEntity, donacion => donacion.causa)
    donaciones: DonacionEntity[];
}
