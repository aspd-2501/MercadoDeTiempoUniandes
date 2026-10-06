/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido-categoria.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';

@Entity()
export class ServicioOfrecidoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.serviciosOfrecidos)
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    @OneToMany(() => ServicioOfrecidoCategoriaEntity, sc => sc.servicio)
    categorias: ServicioOfrecidoCategoriaEntity[];

    @OneToMany(() => SolicitudAyudaEntity, solicitud => solicitud.servicioOfrecido)
    solicitudes: SolicitudAyudaEntity[];
}