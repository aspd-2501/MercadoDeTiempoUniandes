/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ModeradorService } from './moderador.service';
import { ModeradorEntity } from './moderador.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

@Module({
    imports: [TypeOrmModule.forFeature([ModeradorEntity, UsuarioEntity])],
    providers: [ModeradorService],
})
export class ModeradorModule {}