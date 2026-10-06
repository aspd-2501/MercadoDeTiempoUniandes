import { Module } from '@nestjs/common';
import { DepositoHorasService } from './deposito-horas.service';

@Module({
  providers: [DepositoHorasService]
})
export class DepositoHorasModule {}
