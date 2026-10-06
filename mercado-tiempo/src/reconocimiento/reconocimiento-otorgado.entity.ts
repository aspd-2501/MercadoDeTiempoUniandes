/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento-otorgado.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ReconocimientoEntity } from './reconocimiento.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';

@Entity()
export class ReconocimientoOtorgadoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fecha: Date;

    @ManyToOne(() => ReconocimientoEntity, reconocimiento => reconocimiento.otorgamientos)
    @JoinColumn({ name: 'idReconocimiento' })
    reconocimiento: ReconocimientoEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.reconocimientosRecibidos)
    @JoinColumn({ name: 'idPerfilReceptor' })
    perfilReceptor: PerfilMiembroEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.reconocimientosOtorgados, { nullable: true })
    @JoinColumn({ name: 'idPerfilOtorgante' })
    perfilOtorgante: PerfilMiembroEntity;

    @ManyToOne(() => PostComunitarioEntity, post => post.reconocimientos, { nullable: true })
    @JoinColumn({ name: 'idPostComunitario' })
    postComunitario: PostComunitarioEntity;
}