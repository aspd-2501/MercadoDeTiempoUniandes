import { Module } from '@nestjs/common';
import { ServicioPotencialService } from './servicio-potencial.service';

@Module({
  providers: [ServicioPotencialService]
})
export class ServicioPotencialModule {}
