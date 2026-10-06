/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.entity.ts */
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PerfilOrganizacionEntity } from '../perfil-organizacion/perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from '../perfil-organizacion/miembro-organizacion.entity';
import { DonacionEntity } from '../donacion/donacion.entity';
import { CausaEntity } from '../causa/causa.entity';
import { ChatParticipanteEntity } from '../chat/chat-participante.entity';
import { MensajeEntity } from '../mensaje/mensaje.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { ServicioPotencialEntity } from '../servicio-potencial/servicio-potencial.entity';
import { ParticipanteAcuerdoEntity } from '../acuerdo/participante-acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { UsuarioPostEntity } from '../post-comunitario/usuario-post.entity';
import { ReconocimientoOtorgadoEntity } from '../reconocimiento/reconocimiento-otorgado.entity';
import { InscripcionActividadEntity } from '../actividad-comunitaria/inscripcion-actividad.entity';

@Entity()
export class PerfilMiembroEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    imagen: string;

    @Column()
    descripcion: string;

    @Column()
    intereses: string;

    @Column()
    estadoActividad: boolean;

    @Column()
    saldo: number;

    // --- Usuario (1 a 1, PerfilMiembro es dueño vía idUniandes) ---
    @OneToOne(() => UsuarioEntity, usuario => usuario.perfil)
    @JoinColumn({ name: 'idUniandes' })
    usuario: UsuarioEntity;

    // --- Subtipo PerfilOrganización (1 a 1 opcional; dueño: PerfilOrganizacion) ---
    @OneToOne(() => PerfilOrganizacionEntity, organizacion => organizacion.perfil)
    perfilOrganizacion: PerfilOrganizacionEntity;

    // --- Pertenencia a organizaciones (N:M vía MiembroOrganizacion) ---
    @OneToMany(() => MiembroOrganizacionEntity, mo => mo.perfil)
    organizaciones: MiembroOrganizacionEntity[];

    // --- Donaciones hechas y recibidas ---
    @OneToMany(() => DonacionEntity, donacion => donacion.perfilDonante)
    donacionesHechas: DonacionEntity[];

    @OneToMany(() => DonacionEntity, donacion => donacion.perfilReceptor)
    donacionesRecibidas: DonacionEntity[];

    // --- Causas creadas y recibidas ---
    @OneToMany(() => CausaEntity, causa => causa.perfilCreador)
    causasCreadas: CausaEntity[];

    @OneToMany(() => CausaEntity, causa => causa.perfilReceptor)
    causasRecibidas: CausaEntity[];

    // --- Chats (N:M vía ChatParticipante) ---
    @OneToMany(() => ChatParticipanteEntity, cp => cp.perfil)
    chats: ChatParticipanteEntity[];

    // --- Mensajes enviados ---
    @OneToMany(() => MensajeEntity, mensaje => mensaje.emisor)
    mensajes: MensajeEntity[];

    // --- Solicitudes de ayuda: creadas y prestadas ---
    @OneToMany(() => SolicitudAyudaEntity, solicitud => solicitud.perfilAutor)
    solicitudesCreadas: SolicitudAyudaEntity[];

    @OneToMany(() => SolicitudAyudaEntity, solicitud => solicitud.perfilPrestador)
    solicitudesPrestadas: SolicitudAyudaEntity[];

    // --- Posts de ayuda creados ---
    @OneToMany(() => PostAyudaEntity, post => post.perfilAutor)
    postsDeAyuda: PostAyudaEntity[];

    // --- Servicios ofrecidos y potenciales ---
    @OneToMany(() => ServicioOfrecidoEntity, servicio => servicio.perfil)
    serviciosOfrecidos: ServicioOfrecidoEntity[];

    @OneToMany(() => ServicioPotencialEntity, servicio => servicio.perfil)
    serviciosPotenciales: ServicioPotencialEntity[];

    // --- Participación en acuerdos (N:M con atributo "rol") ---
    @OneToMany(() => ParticipanteAcuerdoEntity, participante => participante.perfil)
    acuerdos: ParticipanteAcuerdoEntity[];

    // --- Horarios disponibles propuestos ---
    @OneToMany(() => HorarioDisponibleEntity, horario => horario.perfil)
    horariosDisponibles: HorarioDisponibleEntity[];

    // --- Posts comunitarios (N:M vía UsuarioPost) ---
    @OneToMany(() => UsuarioPostEntity, up => up.perfil)
    postsComunitarios: UsuarioPostEntity[];

    // --- Reconocimientos recibidos y otorgados ---
    @OneToMany(() => ReconocimientoOtorgadoEntity, r => r.perfilReceptor)
    reconocimientosRecibidos: ReconocimientoOtorgadoEntity[];

    @OneToMany(() => ReconocimientoOtorgadoEntity, r => r.perfilOtorgante)
    reconocimientosOtorgados: ReconocimientoOtorgadoEntity[];

    // --- Actividades comunitarias inscritas (N:M) ---
    @OneToMany(() => InscripcionActividadEntity, i => i.perfil)
    actividadesInscritas: InscripcionActividadEntity[];
}