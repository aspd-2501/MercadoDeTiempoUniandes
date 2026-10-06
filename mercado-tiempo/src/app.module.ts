/* eslint-disable prettier/prettier */
/* archivo: src/app.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Módulos
import { UsuarioModule } from './usuario/usuario.module';
import { ModeradorModule } from './moderador/moderador.module';
import { PerfilMiembroModule } from './perfil-miembro/perfil-miembro.module';
import { PerfilOrganizacionModule } from './perfil-organizacion/perfil-organizacion.module';
import { DepositoHorasModule } from './deposito-horas/deposito-horas.module';
import { DonacionModule } from './donacion/donacion.module';
import { CausaModule } from './causa/causa.module';
import { ChatModule } from './chat/chat.module';
import { MensajeModule } from './mensaje/mensaje.module';
import { CategoriaModule } from './categoria/categoria.module';
import { PostAyudaModule } from './post-ayuda/post-ayuda.module';
import { SolicitudAyudaModule } from './solicitud-ayuda/solicitud-ayuda.module';
import { ServicioOfrecidoModule } from './servicio-ofrecido/servicio-ofrecido.module';
import { ServicioPotencialModule } from './servicio-potencial/servicio-potencial.module';
import { AcuerdoModule } from './acuerdo/acuerdo.module';
import { HorarioDisponibleModule } from './horario-disponible/horario-disponible.module';
import { PostComunitarioModule } from './post-comunitario/post-comunitario.module';
import { ReconocimientoModule } from './reconocimiento/reconocimiento.module';
import { ActividadComunitariaModule } from './actividad-comunitaria/actividad-comunitaria.module';
import { OrganizacionInstitucionalModule } from './organizacion-institucional/organizacion-institucional.module';

// Entidades
import { UsuarioEntity } from './usuario/usuario.entity';
import { ModeradorEntity } from './moderador/moderador.entity';
import { PerfilMiembroEntity } from './perfil-miembro/perfil-miembro.entity';
import { PerfilOrganizacionEntity } from './perfil-organizacion/perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from './perfil-organizacion/miembro-organizacion.entity';
import { DepositoHorasEntity } from './deposito-horas/deposito-horas.entity';
import { DonacionEntity } from './donacion/donacion.entity';
import { CausaEntity } from './causa/causa.entity';
import { ChatEntity } from './chat/chat.entity';
import { ChatParticipanteEntity } from './chat/chat-participante.entity';
import { MensajeEntity } from './mensaje/mensaje.entity';
import { CategoriaEntity } from './categoria/categoria.entity';
import { PostAyudaEntity } from './post-ayuda/post-ayuda.entity';
import { PostAyudaCategoriaEntity } from './post-ayuda/post-ayuda-categoria.entity';
import { SolicitudAyudaEntity } from './solicitud-ayuda/solicitud-ayuda.entity';
import { ServicioOfrecidoEntity } from './servicio-ofrecido/servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido/servicio-ofrecido-categoria.entity';
import { ServicioPotencialEntity } from './servicio-potencial/servicio-potencial.entity';
import { ServicioPotencialCategoriaEntity } from './servicio-potencial/servicio-potencial-categoria.entity';
import { AcuerdoEntity } from './acuerdo/acuerdo.entity';
import { ParticipanteAcuerdoEntity } from './acuerdo/participante-acuerdo.entity';
import { HorarioDisponibleEntity } from './horario-disponible/horario-disponible.entity';
import { PostComunitarioEntity } from './post-comunitario/post-comunitario.entity';
import { UsuarioPostEntity } from './post-comunitario/usuario-post.entity';
import { ReconocimientoEntity } from './reconocimiento/reconocimiento.entity';
import { ReconocimientoOtorgadoEntity } from './reconocimiento/reconocimiento-otorgado.entity';
import { ActividadComunitariaEntity } from './actividad-comunitaria/actividad-comunitaria.entity';
import { InscripcionActividadEntity } from './actividad-comunitaria/inscripcion-actividad.entity';
import { OrganizacionInstitucionalEntity } from './organizacion-institucional/organizacion-institucional.entity';

@Module({
  imports: [
    UsuarioModule,
    ModeradorModule,
    PerfilMiembroModule,
    PerfilOrganizacionModule,
    DepositoHorasModule,
    DonacionModule,
    CausaModule,
    ChatModule,
    MensajeModule,
    CategoriaModule,
    PostAyudaModule,
    SolicitudAyudaModule,
    ServicioOfrecidoModule,
    ServicioPotencialModule,
    AcuerdoModule,
    HorarioDisponibleModule,
    PostComunitarioModule,
    ReconocimientoModule,
    ActividadComunitariaModule,
    OrganizacionInstitucionalModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'mercado-tiempo',
      entities: [
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
        ServicioPotencialEntity,
        ServicioPotencialCategoriaEntity,
        AcuerdoEntity,
        ParticipanteAcuerdoEntity,
        HorarioDisponibleEntity,
        PostComunitarioEntity,
        UsuarioPostEntity,
        ReconocimientoEntity,
        ReconocimientoOtorgadoEntity,
        ActividadComunitariaEntity,
        InscripcionActividadEntity,
        OrganizacionInstitucionalEntity,
      ],
      dropSchema: true,
      synchronize: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}