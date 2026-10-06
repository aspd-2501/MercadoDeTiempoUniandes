import { Module } from '@nestjs/common';
import { ModeradorService } from './moderador.service';

@Module({
  providers: [ModeradorService]
})
export class ModeradorModule {}
