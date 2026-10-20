/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioPotencialService } from './servicio-potencial.service';
import { ServicioPotencialEntity } from './servicio-potencial.entity';
import { ServicioPotencialCategoriaEntity } from './servicio-potencial-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { ServicioPotencialController } from './servicio-potencial.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        ServicioPotencialEntity,
        ServicioPotencialCategoriaEntity,
        PerfilMiembroEntity,
        CategoriaEntity,
    ])],
    providers: [ServicioPotencialService],
    controllers: [ServicioPotencialController],
})
export class ServicioPotencialModule {}