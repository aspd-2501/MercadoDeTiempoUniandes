/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.entity.ts */
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostAyudaCategoriaEntity } from '../post-ayuda/post-ayuda-categoria.entity';
import { ServicioOfrecidoCategoriaEntity } from '../servicio-ofrecido/servicio-ofrecido-categoria.entity';
import { ServicioPotencialCategoriaEntity } from '../servicio-potencial/servicio-potencial-categoria.entity';

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

    @OneToMany(() => ServicioPotencialCategoriaEntity, sc => sc.categoria)
    serviciosPotenciales: ServicioPotencialCategoriaEntity[];
}