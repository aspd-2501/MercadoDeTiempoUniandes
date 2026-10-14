/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        ServicioOfrecidoEntity,
        ServicioOfrecidoCategoriaEntity,
        PerfilMiembroEntity,
        CategoriaEntity,
    ])],
    providers: [ServicioOfrecidoService],
})
export class ServicioOfrecidoModule {}