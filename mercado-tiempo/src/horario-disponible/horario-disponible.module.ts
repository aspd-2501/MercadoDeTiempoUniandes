import { Module } from '@nestjs/common';
import { HorarioDisponibleService } from './horario-disponible.service';

@Module({
  providers: [HorarioDisponibleService]
})
export class HorarioDisponibleModule {}
