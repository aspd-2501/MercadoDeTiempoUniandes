/* eslint-disable prettier/prettier */
/* archivo: src/shared/testing-utils/typeorm-testing-config.ts */
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioEntity } from '../../usuario/usuario.entity';
import { ModeradorEntity } from '../../moderador/moderador.entity';
import { PerfilMiembroEntity } from '../../perfil-miembro/perfil-miembro.entity';
import { PerfilOrganizacionEntity } from '../../perfil-organizacion/perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from '../../perfil-organizacion/miembro-organizacion.entity';
import { DepositoHorasEntity } from '../../deposito-horas/deposito-horas.entity';
import { DonacionEntity } from '../../donacion/donacion.entity';
import { CausaEntity } from '../../causa/causa.entity';
import { ChatEntity } from '../../chat/chat.entity';
import { ChatParticipanteEntity } from '../../chat/chat-participante.entity';
import { MensajeEntity } from '../../mensaje/mensaje.entity';
import { CategoriaEntity } from '../../categoria/categoria.entity';
import { PostAyudaEntity } from '../../post-ayuda/post-ayuda.entity';
import { PostAyudaCategoriaEntity } from '../../post-ayuda/post-ayuda-categoria.entity';
import { SolicitudAyudaEntity } from '../../solicitud-ayuda/solicitud-ayuda.entity';
import { ServicioOfrecidoEntity } from '../../servicio-ofrecido/servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from '../../servicio-ofrecido/servicio-ofrecido-categoria.entity';
import { PerfilInteresEntity } from '../../perfil-miembro/perfil-interes.entity';
import { AcuerdoEntity } from '../../acuerdo/acuerdo.entity';
import { ParticipanteAcuerdoEntity } from '../../acuerdo/participante-acuerdo.entity';
import { SolicitudModificacionEntity } from '../../solicitud-modificacion/solicitud-modificacion.entity';
import { HorarioDisponibleEntity } from '../../horario-disponible/horario-disponible.entity';
import { PostComunitarioEntity } from '../../post-comunitario/post-comunitario.entity';
import { UsuarioPostEntity } from '../../post-comunitario/usuario-post.entity';
import { ReconocimientoEntity } from '../../reconocimiento/reconocimiento.entity';
import { ReconocimientoOtorgadoEntity } from '../../reconocimiento/reconocimiento-otorgado.entity';
import { ActividadComunitariaEntity } from '../../actividad-comunitaria/actividad-comunitaria.entity';
import { InscripcionActividadEntity } from '../../actividad-comunitaria/inscripcion-actividad.entity';
import { OrganizacionInstitucionalEntity } from '../../organizacion-institucional/organizacion-institucional.entity';
import { AprobacionModificacionEntity } from '../../solicitud-modificacion/aprobacion-modificacion.entity';
import { TransaccionEntity } from '../../transaccion/transaccion.entity';

// --- Todas las entidades: forRoot crea las tablas y forFeature expone sus repositorios a los servicios ---
const entidades = [
    UsuarioEntity,
    ModeradorEntity,
    PerfilMiembroEntity,
    PerfilOrganizacionEntity,
    MiembroOrganizacionEntity,
    DepositoHorasEntity,
    DonacionEntity,
    CausaEntity,
    ChatEntity,
    ChatParticipanteEntity,
    MensajeEntity,
    CategoriaEntity,
    PostAyudaEntity,
    PostAyudaCategoriaEntity,
    SolicitudAyudaEntity,
    ServicioOfrecidoEntity,
    ServicioOfrecidoCategoriaEntity,
    PerfilInteresEntity,
    AcuerdoEntity,
    ParticipanteAcuerdoEntity,
    SolicitudModificacionEntity,
    HorarioDisponibleEntity,
    PostComunitarioEntity,
    UsuarioPostEntity,
    ReconocimientoEntity,
    ReconocimientoOtorgadoEntity,
    ActividadComunitariaEntity,
    InscripcionActividadEntity,
    OrganizacionInstitucionalEntity,
    AprobacionModificacionEntity,
    TransaccionEntity,
];

export const TypeOrmTestingConfig = () => [
    TypeOrmModule.forRoot({
        type: 'better-sqlite3',
        database: ':memory:',
        dropSchema: true,
        entities: entidades,
        synchronize: true,
    }),
    TypeOrmModule.forFeature(entidades),
];
