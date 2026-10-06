/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-de-ayuda/solicitud-de-ayuda.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';


@Entity()
export class SolicitudAyudaEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    titulo: string;

    @Column()
    descripcion: string;

    @Column()
    aceptada: boolean;

    @Column()
    fechaCreacion: Date;

    @Column()
    horas: number;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.solicitudesCreadas)
    @JoinColumn({ name: 'idPerfilAutor' })
    perfilAutor: PerfilMiembroEntity;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.solicitudesPrestadas, { nullable: true })
    @JoinColumn({ name: 'idPerfilPrestador' })
    perfilPrestador: PerfilMiembroEntity;

    @ManyToOne(() => ServicioOfrecidoEntity, servicio => servicio.solicitudes, { nullable: true })
    @JoinColumn({ name: 'idServicioOfrecido' })
    servicioOfrecido: ServicioOfrecidoEntity;

    @OneToOne(() => AcuerdoEntity, acuerdo => acuerdo.solicitud)
    acuerdo: AcuerdoEntity;

    @OneToOne(() => HorarioDisponibleEntity, horario => horario.solicitud)
    horario: HorarioDisponibleEntity;
}
