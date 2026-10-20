/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilOrganizacionService } from './perfil-organizacion.service';
import { PerfilOrganizacionEntity } from './perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from './miembro-organizacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PerfilOrganizacionController } from './perfil-organizacion.controller';

@Module({
    imports: [TypeOrmModule.forFeature([PerfilOrganizacionEntity, MiembroOrganizacionEntity, PerfilMiembroEntity])],
    providers: [PerfilOrganizacionService],
    controllers: [PerfilOrganizacionController],
})
export class PerfilOrganizacionModule {}