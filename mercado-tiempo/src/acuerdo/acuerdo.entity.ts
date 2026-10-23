/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.entity.ts */
import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { ParticipanteAcuerdoEntity } from './participante-acuerdo.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { ChatEntity } from '../chat/chat.entity';
import { SolicitudModificacionEntity } from '../solicitud-modificacion/solicitud-modificacion.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';

export { EstadoAcuerdo };

@Entity()
@Check(`
    (CASE WHEN "idPostAyuda" IS NOT NULL THEN 1 ELSE 0 END) +
    (CASE WHEN "idSolicitud" IS NOT NULL THEN 1 ELSE 0 END) = 1
`)
@Check(`"estado" IN (0, 1, 2, 3)`)
export class AcuerdoEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    horas: number;

    @Column()
    fechaCreacion: Date;

    @Column()
    fechaRealizacion: Date;

    // 0: en creación, 1: acordado, 2: realizado, 3: en modificación
    @Column({ type: 'int', default: EstadoAcuerdo.EN_CREACION })
    estado: EstadoAcuerdo;

    // --- Origen: post o solicitud (exactamente uno, validado por CHECK) ---
    // Un post de ayuda puede generar varios acuerdos (uno por cupo).
    @ManyToOne(() => PostAyudaEntity, post => post.acuerdos, { nullable: true })
    @JoinColumn({ name: 'idPostAyuda' })
    postAyuda: PostAyudaEntity;

    @OneToOne(() => SolicitudAyudaEntity, solicitud => solicitud.acuerdo, { nullable: true })
    @JoinColumn({ name: 'idSolicitud' })
    solicitud: SolicitudAyudaEntity;

    // --- Prestadores y receptores (N:M con atributo "rol") ---
    @OneToMany(() => ParticipanteAcuerdoEntity, participante => participante.acuerdo)
    participantes: ParticipanteAcuerdoEntity[];

    // --- Horarios propuestos para el acuerdo (0..*) ---
    @OneToMany(() => HorarioDisponibleEntity, horario => horario.acuerdo)
    horariosDisponibles: HorarioDisponibleEntity[];

    // --- Horario finalmente acordado (0..1) ---
    @OneToOne(() => HorarioDisponibleEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'idHorarioAcordado' })
    horarioAcordado: HorarioDisponibleEntity | null;

    // --- Chat del acuerdo ---
    @OneToOne(() => ChatEntity, chat => chat.acuerdo, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'idChat' })
    chat: ChatEntity | null;

    // --- Solicitudes de modificación del acuerdo ---
    @OneToMany(() => SolicitudModificacionEntity, s => s.acuerdo)
    solicitudesModificacion: SolicitudModificacionEntity[];

    // --- Publicaciones conjuntas sobre el acuerdo ---
    @OneToMany(() => PostComunitarioEntity, post => post.acuerdo)
    postsComunitarios: PostComunitarioEntity[];
}
