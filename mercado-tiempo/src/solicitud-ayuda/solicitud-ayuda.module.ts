/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudAyudaService } from './solicitud-ayuda.service';
import { SolicitudAyudaEntity } from './solicitud-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';

@Module({
    imports: [TypeOrmModule.forFeature([
        SolicitudAyudaEntity,
        PerfilMiembroEntity,
        ServicioOfrecidoEntity,
    ])],
    providers: [SolicitudAyudaService],
})
export class SolicitudAyudaModule {}