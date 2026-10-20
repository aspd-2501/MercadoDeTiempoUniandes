/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { HorarioDisponibleService } from './horario-disponible.service';
import { HorarioDisponibleEntity } from './horario-disponible.entity';
import { HorarioDisponibleDto } from './horario-disponible.dto';

@Controller('horarios-disponibles')
@UseInterceptors(BusinessErrorsInterceptor)
export class HorarioDisponibleController {
    constructor(private readonly horarioDisponibleService: HorarioDisponibleService) {}

    @Get()
    async findAll() {
        return await this.horarioDisponibleService.findAll();
    }

    @Get(':horarioId')
    async findOne(@Param('horarioId') horarioId: string) {
        return await this.horarioDisponibleService.findOne(horarioId);
    }

    @Post()
    async create(@Body() horarioDto: HorarioDisponibleDto) {
        const horario: HorarioDisponibleEntity = this.dtoToEntity(horarioDto);
        return await this.horarioDisponibleService.create(horario);
    }

    @Delete(':horarioId')
    @HttpCode(204)
    async delete(@Param('horarioId') horarioId: string) {
        return await this.horarioDisponibleService.delete(horarioId);
    }

    // --- Mapeo manual DTO → Entity (perfil obligatorio + 3 orígenes opcionales) ---
    private dtoToEntity(dto: HorarioDisponibleDto): HorarioDisponibleEntity {
        const horario = new HorarioDisponibleEntity();
        horario.fechaInicio = new Date(dto.fechaInicio);
        horario.fechaFin = new Date(dto.fechaFin);
        horario.perfil = { id: dto.perfilId } as any;
        if (dto.acuerdoId) horario.acuerdo = { id: dto.acuerdoId } as any;
        if (dto.solicitudId) horario.solicitud = { id: dto.solicitudId } as any;
        if (dto.postAyudaId) horario.postAyuda = { id: dto.postAyudaId } as any;
        return horario;
    }
}