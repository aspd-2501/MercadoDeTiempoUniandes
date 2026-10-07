import { Module } from '@nestjs/common';
import { SolicitudAyudaService } from './solicitud-ayuda.service';

@Module({
  providers: [SolicitudAyudaService]
})
export class SolicitudAyudaModule {}
