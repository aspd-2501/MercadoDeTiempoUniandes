/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.entity.ts */
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { MiembroOrganizacionEntity } from './miembro-organizacion.entity';

@Entity()
export class PerfilOrganizacionEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    numMiembros: number;

    // --- Subtipo de PerfilMiembro (1 a 1, PerfilOrganizacion es dueño) ---
    @OneToOne(() => PerfilMiembroEntity, perfil => perfil.perfilOrganizacion)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    // --- Miembros que pertenecen a esta organización (N:M vía MiembroOrganizacion) ---
    @OneToMany(() => MiembroOrganizacionEntity, mo => mo.organizacion)
    miembros: MiembroOrganizacionEntity[];
}