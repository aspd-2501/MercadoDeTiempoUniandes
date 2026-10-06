import { Module } from '@nestjs/common';
import { MensajeService } from './mensaje.service';

@Module({
  providers: [MensajeService]
})
export class MensajeModule {}
