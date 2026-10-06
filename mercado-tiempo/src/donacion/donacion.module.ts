import { Module } from '@nestjs/common';
import { DonacionService } from './donacion.service';

@Module({
  providers: [DonacionService]
})
export class DonacionModule {}
