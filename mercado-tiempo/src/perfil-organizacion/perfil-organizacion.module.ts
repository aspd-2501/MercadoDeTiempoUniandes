import { Module } from '@nestjs/common';
import { PerfilOrganizacionService } from './perfil-organizacion.service';

@Module({
  providers: [PerfilOrganizacionService]
})
export class PerfilOrganizacionModule {}
