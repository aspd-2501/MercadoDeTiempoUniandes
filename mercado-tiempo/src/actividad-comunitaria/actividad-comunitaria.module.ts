import { Module } from '@nestjs/common';
import { ActividadComunitariaService } from './actividad-comunitaria.service';

@Module({
  providers: [ActividadComunitariaService]
})
export class ActividadComunitariaModule {}
