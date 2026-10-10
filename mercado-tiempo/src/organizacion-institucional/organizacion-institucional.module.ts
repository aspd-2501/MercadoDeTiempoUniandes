/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizacionInstitucionalService } from './organizacion-institucional.service';
import { OrganizacionInstitucionalEntity } from './organizacion-institucional.entity';

@Module({
    imports: [TypeOrmModule.forFeature([OrganizacionInstitucionalEntity])],
    providers: [OrganizacionInstitucionalService],
})
export class OrganizacionInstitucionalModule {}