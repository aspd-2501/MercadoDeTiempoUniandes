import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadComunitariaEntity } from './actividad-comunitaria.entity';
import { ActividadComunitariaService } from './actividad-comunitaria.service';
import { InscripcionActividadEntity } from './inscripcion-actividad.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ActividadComunitariaController } from './actividad-comunitaria.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadComunitariaEntity, InscripcionActividadEntity, PerfilMiembroEntity])],
  providers: [ActividadComunitariaService],
  controllers: [ActividadComunitariaController],
})
export class ActividadComunitariaModule {}
