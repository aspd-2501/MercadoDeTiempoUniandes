/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { SolicitudModificacionService } from './solicitud-modificacion.service';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { SolicitudModificacionDto } from './solicitud-modificacion.dto';

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

    @Put(':solicitudId')
    async update(
        @Param('acuerdoId') acuerdoId: string,
        @Param('solicitudId') solicitudId: string,
        @Body() dto: SolicitudModificacionDto
    ) {
        return await this.solicitudModificacionService.update(acuerdoId, solicitudId, this.dtoToEntity(dto));
    }

    @Post(':solicitudId/aceptar')
    async aceptar(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string) {
        return await this.solicitudModificacionService.aceptar(acuerdoId, solicitudId);
    }

    @Delete(':solicitudId')
    @HttpCode(204)
    async delete(@Param('acuerdoId') acuerdoId: string, @Param('solicitudId') solicitudId: string) {
        return await this.solicitudModificacionService.delete(acuerdoId, solicitudId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: SolicitudModificacionDto): SolicitudModificacionEntity {
        const solicitud = new SolicitudModificacionEntity();
        solicitud.horas = dto.horas;
        solicitud.fechaCreacion = new Date(dto.fechaCreacion);
        solicitud.fechaRealizacion = new Date(dto.fechaRealizacion);
        if (dto.estado !== undefined) solicitud.estado = dto.estado;
        return solicitud;
    }
}
