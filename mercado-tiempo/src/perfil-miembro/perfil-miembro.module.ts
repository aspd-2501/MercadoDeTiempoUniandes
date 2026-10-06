import { Module } from '@nestjs/common';
import { PerfilMiembroService } from './perfil-miembro.service';

@Module({
  providers: [PerfilMiembroService]
})
export class PerfilMiembroModule {}
