/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioPostEntity } from './usuario-post.entity';
import { ReconocimientoOtorgadoEntity } from '../reconocimiento/reconocimiento-otorgado.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';

@Entity()
export class PostComunitarioEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @Column()
    fechaCreacion: Date;

    @Column()
    imagen: string;

    @Column()
    likes: number;

    // --- Número de usuarios taggeados que han aprobado la publicación ---
    @Column({ default: 0 })
    aprobaciones: number;

    // --- Empieza en false; pasa a true cuando aprobaciones = número de taggeados ---
    @Column({ default: false })
    publico: boolean;

    // --- Creador de la publicación ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.postsComunitariosCreados)
    @JoinColumn({ name: 'idPerfilCreador' })
    creador: PerfilMiembroEntity;

    // --- Acuerdo sobre el que trata la publicación conjunta ---
    @ManyToOne(() => AcuerdoEntity, acuerdo => acuerdo.postsComunitarios, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'idAcuerdo' })
    acuerdo: AcuerdoEntity;

    // --- Usuarios taggeados (N:M vía UsuarioPost, mínimo 2) ---
    @OneToMany(() => UsuarioPostEntity, up => up.post)
    participantes: UsuarioPostEntity[];

    // --- Reconocimientos otorgados dentro de este post (opcional) ---
    @OneToMany(() => ReconocimientoOtorgadoEntity, r => r.postComunitario)
    reconocimientos: ReconocimientoOtorgadoEntity[];
}
