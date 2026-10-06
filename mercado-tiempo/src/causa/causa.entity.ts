/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

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

    // --- Creador y receptor (ambos obligatorios, pueden ser el mismo perfil) ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.causasCreadas)
    @JoinColumn({ name: 'idPerfilCreador' })
    perfilCreador: PerfilMiembroEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.causasRecibidas)
    @JoinColumn({ name: 'idPerfilReceptor' })
    perfilReceptor: PerfilMiembroEntity;
}