/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.controller.ts */
import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { SolicitudModificacionService } from './solicitud-modificacion.service';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { SolicitudModificacionDto } from './solicitud-modificacion.dto';
import { DecisionSolicitudDto } from './decision-solicitud.dto';

@Controller('acuerdos/:acuerdoId/solicitudes-modificacion')
@UseInterceptors(BusinessErrorsInterceptor)
export class SolicitudModificacionController {
    constructor(private readonly solicitudModificacionService: SolicitudModificacionService) {}

    @Get()
    async findAll(@Param('acuerdoId') acuerdoId: string) {
        return await this.solicitudModificacionService.findAllByAcuerdoId(acuerdoId);
    }

    @Get(':solicitudId')
    async findOne(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string) {
        return await this.solicitudModificacionService.findOne(acuerdoId, solicitudId);
    }

    @Post()
    async create(@Param('acuerdoId') acuerdoId: string, @Body() dto: SolicitudModificacionDto) {
        return await this.solicitudModificacionService.create(acuerdoId, this.dtoToEntity(dto));
    }

    @Post(':solicitudId/aprobar')
    async aprobar(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string, @Body() dto: DecisionSolicitudDto) {
        return await this.solicitudModificacionService.aprobar(acuerdoId, solicitudId, dto.perfilId);
    }

    @Post(':solicitudId/rechazar')
    async rechazar(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string, @Body() dto: DecisionSolicitudDto) {
        return await this.solicitudModificacionService.rechazar(acuerdoId, solicitudId, dto.perfilId);
    }

    @Post(':solicitudId/retirar')
    async retirar(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string, @Body() dto: DecisionSolicitudDto) {
        return await this.solicitudModificacionService.retirar(acuerdoId, solicitudId, dto.perfilId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: SolicitudModificacionDto): SolicitudModificacionEntity {
        const solicitud = new SolicitudModificacionEntity();
        solicitud.tipo = dto.tipo;
        solicitud.solicitante = { id: dto.solicitanteId } as any;
        solicitud.horas = dto.horas ?? null;
        if (dto.fechaRealizacion) solicitud.fechaRealizacion = new Date(dto.fechaRealizacion);
        return solicitud;
    }
}
