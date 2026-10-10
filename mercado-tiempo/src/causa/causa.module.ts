/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CausaService } from './causa.service';
import { CausaEntity } from './causa.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Module({
    imports: [TypeOrmModule.forFeature([CausaEntity, PerfilMiembroEntity])],
    providers: [CausaService],
})
export class CausaModule {}