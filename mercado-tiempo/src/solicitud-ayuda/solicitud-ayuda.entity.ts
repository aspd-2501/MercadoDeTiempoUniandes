/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.entity.ts */
import { Column, Entity, JoinColumn, ManyToOne, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PerfilOrganizacionEntity } from '../perfil-organizacion/perfil-organizacion.entity';
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

    // --- Solicitante: el miembro que pide la ayuda ---
    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.solicitudes, { nullable: false })
    @JoinColumn({ name: 'idPerfilAutor' })
    perfilAutor: PerfilMiembroEntity;

    // --- Prestador: la organización a la que se envía la solicitud (obligatorio) ---
    @ManyToOne(() => PerfilOrganizacionEntity, organizacion => organizacion.solicitudesRecibidas, { nullable: false })
    @JoinColumn({ name: 'idPrestador' })
    prestador: PerfilOrganizacionEntity;

    @ManyToOne(() => ServicioOfrecidoEntity, servicio => servicio.solicitudes, { nullable: true })
    @JoinColumn({ name: 'idServicioOfrecido' })
    servicioOfrecido: ServicioOfrecidoEntity;

    @OneToOne(() => AcuerdoEntity, acuerdo => acuerdo.solicitud)
    acuerdo: AcuerdoEntity;

    @OneToOne(() => HorarioDisponibleEntity, horario => horario.solicitud)
    horario: HorarioDisponibleEntity;
}