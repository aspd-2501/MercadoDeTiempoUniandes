/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioService } from './usuario.service';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioController } from './usuario.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UsuarioEntity])],
    providers: [UsuarioService],
    exports: [UsuarioService],
    controllers: [UsuarioController],
})
export class UsuarioModule {}