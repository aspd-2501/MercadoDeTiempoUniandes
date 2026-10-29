/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/aprobacion-modificacion.entity.ts */
import { CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

// --- Aprobación de un participante sobre una solicitud de modificación (RF-042) ---
@Entity()
export class AprobacionModificacionEntity {
    @PrimaryColumn()
    idSolicitud: string;

    @PrimaryColumn()
    idPerfil: string;

    @CreateDateColumn()
    fecha: Date;

    @ManyToOne(() => SolicitudModificacionEntity, s => s.aprobaciones, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idSolicitud' })
    solicitud: SolicitudModificacionEntity;

    @ManyToOne(() => PerfilMiembroEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;
}
