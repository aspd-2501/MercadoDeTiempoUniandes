import { Module } from '@nestjs/common';
import { OrganizacionInstitucionalService } from './organizacion-institucional.service';

@Module({
  providers: [OrganizacionInstitucionalService]
})
export class OrganizacionInstitucionalModule {}
