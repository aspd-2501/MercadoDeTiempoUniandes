import { Module } from '@nestjs/common';
import { ReconocimientoService } from './reconocimiento.service';

@Module({
  providers: [ReconocimientoService]
})
export class ReconocimientoModule {}
