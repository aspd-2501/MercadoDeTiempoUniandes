/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/busqueda.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusquedaService } from './busqueda.service';
import { BusquedaController } from './busqueda.controller';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';

// Búsquedas de la pantalla Explorar
@Module({
    imports: [TypeOrmModule.forFeature([PerfilMiembroEntity, PostAyudaEntity, ServicioOfrecidoEntity])],
    providers: [BusquedaService],
    controllers: [BusquedaController],
})
export class BusquedaModule {}
