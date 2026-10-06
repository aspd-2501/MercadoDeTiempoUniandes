import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PerfilMiembroModule } from './perfil-miembro/perfil-miembro.module';
import { ModeradorModule } from './moderador/moderador.module';
import { CausaModule } from './causa/causa.module';
import { DonacionModule } from './donacion/donacion.module';
import { DepositoHorasModule } from './deposito-horas/deposito-horas.module';
import { PostComunitarioModule } from './post-comunitario/post-comunitario.module';
import { ReconocimientoModule } from './reconocimiento/reconocimiento.module';
import { PerfilOrganizacionModule } from './perfil-organizacion/perfil-organizacion.module';
import { ActividadComunitariaModule } from './actividad-comunitaria/actividad-comunitaria.module';
import { OrganizacionInstitucionalModule } from './organizacion-institucional/organizacion-institucional.module';
import { PostAyudaModule } from './post-ayuda/post-ayuda.module';
import { ServicioPotencialModule } from './servicio-potencial/servicio-potencial.module';
import { ServicioOfrecidoModule } from './servicio-ofrecido/servicio-ofrecido.module';
import { CategoriaModule } from './categoria/categoria.module';
import { SolicitudAyudaModule } from './solicitud-ayuda/solicitud-ayuda.module';
import { HorarioDisponibleModule } from './horario-disponible/horario-disponible.module';
import { AcuerdoModule } from './acuerdo/acuerdo.module';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com
    ObserveModule.forRoot({
      appKey: 'YOUR_APP_KEY',
      appSecret: 'YOUR_APP_SECRET',
      serviceId: 'mercado-tiempo',
    }),
    PerfilMiembroModule,
    ModeradorModule,
    CausaModule,
    DonacionModule,
    DepositoHorasModule,
    PostComunitarioModule,
    ReconocimientoModule,
    PerfilOrganizacionModule,
    ActividadComunitariaModule,
    OrganizacionInstitucionalModule,
    PostAyudaModule,
    ServicioPotencialModule,
    ServicioOfrecidoModule,
    CategoriaModule,
    SolicitudAyudaModule,
    HorarioDisponibleModule,
    AcuerdoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
