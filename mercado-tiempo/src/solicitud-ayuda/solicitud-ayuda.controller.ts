/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { SolicitudAyudaService } from './solicitud-ayuda.service';
import { SolicitudAyudaEntity } from './solicitud-ayuda.entity';
import { SolicitudAyudaDto } from './solicitud-ayuda.dto';

@Controller('solicitudes-ayuda')
@UseInterceptors(BusinessErrorsInterceptor)
export class SolicitudAyudaController {
    constructor(private readonly solicitudAyudaService: SolicitudAyudaService) {}

    @Get()
    async findAll() {
        return await this.solicitudAyudaService.findAll();
    }

    @Get(':solicitudId')
    async findOne(@Param('solicitudId') solicitudId: string) {
        return await this.solicitudAyudaService.findOne(solicitudId);
    }

    @Post()
    async create(@Body() dto: SolicitudAyudaDto) {
        const solicitud: SolicitudAyudaEntity = this.dtoToEntity(dto);
        return await this.solicitudAyudaService.create(solicitud);
    }

    @Put(':solicitudId')
    async update(@Param('solicitudId') solicitudId: string, @Body() dto: SolicitudAyudaDto) {
        const solicitud: SolicitudAyudaEntity = this.dtoToEntity(dto);
        return await this.solicitudAyudaService.update(solicitudId, solicitud);
    }

    @Delete(':solicitudId')
    @HttpCode(204)
    async delete(@Param('solicitudId') solicitudId: string) {
        return await this.solicitudAyudaService.delete(solicitudId);
    }

    @Post(':solicitudId/aceptar')
    async aceptarSolicitud(@Param('solicitudId') solicitudId: string) {
        return await this.solicitudAyudaService.aceptarSolicitud(solicitudId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: SolicitudAyudaDto): SolicitudAyudaEntity {
        const solicitud = new SolicitudAyudaEntity();
        solicitud.titulo = dto.titulo;
        solicitud.descripcion = dto.descripcion;
        solicitud.fechaCreacion = new Date(dto.fechaCreacion);
        solicitud.horas = dto.horas;
        solicitud.perfilAutor = { id: dto.perfilAutorId } as any;
        solicitud.prestador = { id: dto.prestadorId } as any;
        if (dto.servicioOfrecidoId) solicitud.servicioOfrecido = { id: dto.servicioOfrecidoId } as any;
        return solicitud;
    }
}