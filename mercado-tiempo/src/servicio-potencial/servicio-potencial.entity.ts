/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial.entity.ts */
import { Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ServicioPotencialCategoriaEntity } from './servicio-potencial-categoria.entity';

@Entity()
export class ServicioPotencialEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.serviciosPotenciales)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    @OneToMany(() => ServicioPotencialCategoriaEntity, sc => sc.servicio)
    categorias: ServicioPotencialCategoriaEntity[];
}