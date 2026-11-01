/* eslint-disable prettier/prettier */
/* archivo: src/agenda-miembro/agenda-miembro.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgendaMiembroService } from './agenda-miembro.service';
import { AgendaMiembroController } from './agenda-miembro.controller';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ParticipanteAcuerdoEntity } from '../acuerdo/participante-acuerdo.entity';
import { InscripcionActividadEntity } from '../actividad-comunitaria/inscripcion-actividad.entity';

// Consultas de la agenda de un miembro: sus acuerdos y su calendario personal
@Module({
    imports: [TypeOrmModule.forFeature([PerfilMiembroEntity, ParticipanteAcuerdoEntity, InscripcionActividadEntity])],
    providers: [AgendaMiembroService],
    controllers: [AgendaMiembroController],
})
export class AgendaMiembroModule {}
