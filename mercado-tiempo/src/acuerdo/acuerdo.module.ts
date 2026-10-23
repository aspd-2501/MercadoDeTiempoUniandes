/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { ParticipanteAcuerdoEntity } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { ChatEntity } from '../chat/chat.entity';
import { AcuerdoController } from './acuerdo.controller';

@Module({
    imports: [TypeOrmModule.forFeature([AcuerdoEntity, ParticipanteAcuerdoEntity, PerfilMiembroEntity, HorarioDisponibleEntity, ChatEntity])],
    providers: [AcuerdoService],
    controllers: [AcuerdoController],
})
export class AcuerdoModule {}