/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.entity.ts */
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';

@Entity()
export class UsuarioEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    idUniandes: string;

    @Column()
    nombre: string;

    @Column()
    contrasenia: string;

    @Column()
    edad: number;

    @Column()
    afiliacionUniandes: string;

    @OneToOne(() => PerfilMiembroEntity, perfil => perfil.usuario)
    perfil: PerfilMiembroEntity;

    @OneToOne(() => ModeradorEntity, moderador => moderador.usuario)
    moderador: ModeradorEntity;
}