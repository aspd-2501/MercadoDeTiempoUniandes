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

@Module({
    imports: [TypeOrmModule.forFeature([
        HorarioDisponibleEntity,
        PerfilMiembroEntity,
        AcuerdoEntity,
        SolicitudAyudaEntity,
        PostAyudaEntity,
    ])],
    providers: [HorarioDisponibleService],
})
export class HorarioDisponibleModule {}