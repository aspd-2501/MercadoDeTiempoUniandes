/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/miembro-organizacion.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PerfilOrganizacionEntity } from './perfil-organizacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Entity()
export class MiembroOrganizacionEntity {
    @PrimaryColumn()
    idOrganizacion: string;

    @PrimaryColumn()
    idPerfil: string;

    @ManyToOne(() => PerfilOrganizacionEntity, organizacion => organizacion.miembros, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idOrganizacion' })
    organizacion: PerfilOrganizacionEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.organizaciones)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}