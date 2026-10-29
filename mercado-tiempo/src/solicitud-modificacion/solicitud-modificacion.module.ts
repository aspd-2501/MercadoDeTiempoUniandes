/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudModificacionService } from './solicitud-modificacion.service';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { AprobacionModificacionEntity } from './aprobacion-modificacion.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { ParticipanteAcuerdoEntity } from '../acuerdo/participante-acuerdo.entity';
import { SolicitudModificacionController } from './solicitud-modificacion.controller';

@Module({
    imports: [TypeOrmModule.forFeature([
        SolicitudModificacionEntity,
        AprobacionModificacionEntity,
        AcuerdoEntity,
        ParticipanteAcuerdoEntity,
    ])],
    providers: [SolicitudModificacionService],
    controllers: [SolicitudModificacionController],
})
export class SolicitudModificacionModule {}
