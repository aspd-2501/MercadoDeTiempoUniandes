/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { ServicioOfrecidoController } from './servicio-ofrecido.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        ServicioOfrecidoEntity,
        ServicioOfrecidoCategoriaEntity,
        PerfilMiembroEntity,
        CategoriaEntity,
    ])],
    providers: [ServicioOfrecidoService],
    controllers: [ServicioOfrecidoController],
})
export class ServicioOfrecidoModule {}