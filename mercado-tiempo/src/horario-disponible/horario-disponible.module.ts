/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HorarioDisponibleService } from './horario-disponible.service';
import { HorarioDisponibleEntity } from './horario-disponible.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ActividadComunitariaEntity } from '../actividad-comunitaria/actividad-comunitaria.entity';
import { HorarioDisponibleController } from './horario-disponible.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        HorarioDisponibleEntity,
        PerfilMiembroEntity,
        AcuerdoEntity,
        SolicitudAyudaEntity,
        PostAyudaEntity,
        ActividadComunitariaEntity,
    ])],
    providers: [HorarioDisponibleService],
    controllers: [HorarioDisponibleController],
})
export class HorarioDisponibleModule {}