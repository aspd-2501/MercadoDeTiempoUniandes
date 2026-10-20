/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilMiembroService } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PerfilMiembroController } from './perfil-miembro.controller';


@Module({
    imports: [TypeOrmModule.forFeature([PerfilMiembroEntity, UsuarioEntity])],
    providers: [PerfilMiembroService],
    exports: [TypeOrmModule],
    controllers: [PerfilMiembroController],
})
export class PerfilMiembroModule {}