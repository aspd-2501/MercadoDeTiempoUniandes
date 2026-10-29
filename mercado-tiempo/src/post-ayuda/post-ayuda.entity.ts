/* eslint-disable prettier/prettier */
/* archivo: src/post-de-ayuda/post-de-ayuda.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostAyudaCategoriaEntity } from './post-ayuda-categoria.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';

@Entity()
export class PostAyudaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @Column()
    horas: number;

    @Column()
    imagen: string;

    @Column()
    ofrece: boolean;

    @Column()
    cupo: number;

    @Column()
    cupoLleno: boolean;

    @Column()
    fechaCreacion: Date;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.postsDeAyuda)
    @JoinColumn({ name: 'idPerfilAutor' })
    perfilAutor: PerfilMiembroEntity;

    @OneToMany(() => PostAyudaCategoriaEntity, pc => pc.post)
    categorias: PostAyudaCategoriaEntity[];

    // --- Acuerdos generados a partir del post (0..*) ---
    @OneToMany(() => AcuerdoEntity, acuerdo => acuerdo.postAyuda)
    acuerdos: AcuerdoEntity[];

    // --- Franjas de disponibilidad propuestas por el autor (RF-036) ---
    @OneToMany(() => HorarioDisponibleEntity, horario => horario.postAyuda)
    horariosDisponibles: HorarioDisponibleEntity[];
}