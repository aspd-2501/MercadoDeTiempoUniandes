import { Module } from '@nestjs/common';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';

@Module({
  providers: [ServicioOfrecidoService]
})
export class ServicioOfrecidoModule {}
