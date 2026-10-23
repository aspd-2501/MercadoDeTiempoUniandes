/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilMiembroService } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { PerfilInteresEntity } from './perfil-interes.entity';
import { PerfilMiembroController } from './perfil-miembro.controller';


@Module({
    imports: [TypeOrmModule.forFeature([PerfilMiembroEntity, UsuarioEntity, CategoriaEntity, PerfilInteresEntity])],
    providers: [PerfilMiembroService],
    exports: [TypeOrmModule],
    controllers: [PerfilMiembroController],
})
export class PerfilMiembroModule {}