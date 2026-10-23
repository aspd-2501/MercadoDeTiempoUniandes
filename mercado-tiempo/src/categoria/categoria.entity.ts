/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostAyudaCategoriaEntity } from '../post-ayuda/post-ayuda-categoria.entity';
import { ServicioOfrecidoCategoriaEntity } from '../servicio-ofrecido/servicio-ofrecido-categoria.entity';
import { PerfilInteresEntity } from '../perfil-miembro/perfil-interes.entity';

@Entity()
export class CategoriaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    nombre: string;

    @OneToMany(() => PostAyudaCategoriaEntity, pc => pc.categoria)
    postsDeAyuda: PostAyudaCategoriaEntity[];

    @OneToMany(() => ServicioOfrecidoCategoriaEntity, sc => sc.categoria)
    serviciosOfrecidos: ServicioOfrecidoCategoriaEntity[];

    @OneToMany(() => PerfilInteresEntity, pi => pi.categoria)
    perfilesInteresados: PerfilInteresEntity[];
}