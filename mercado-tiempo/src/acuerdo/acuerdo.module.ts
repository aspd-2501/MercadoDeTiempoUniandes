import { Module } from '@nestjs/common';
import { AcuerdoService } from './acuerdo.service';

@Module({
  providers: [AcuerdoService]
})
export class AcuerdoModule {}
