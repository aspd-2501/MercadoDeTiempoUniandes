/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CausaService } from './causa.service';
import { CausaEntity } from './causa.entity';
import { CausaDto } from './causa.dto';

@Controller('causas')
@UseInterceptors(BusinessErrorsInterceptor)
export class CausaController {
    constructor(private readonly causaService: CausaService) {}

    @Get()
    async findAll() {
        return await this.causaService.findAll();
    }

    @Get(':causaId')
    async findOne(@Param('causaId') causaId: string) {
        return await this.causaService.findOne(causaId);
    }

    @Post()
    async create(@Body() causaDto: CausaDto) {
        const causa: CausaEntity = this.dtoToEntity(causaDto);
        return await this.causaService.create(causa);
    }

    @Put(':causaId')
    async update(@Param('causaId') causaId: string, @Body() causaDto: CausaDto) {
        const causa: CausaEntity = this.dtoToEntity(causaDto);
        return await this.causaService.update(causaId, causa);
    }

    @Delete(':causaId')
    @HttpCode(204)
    async delete(@Param('causaId') causaId: string) {
        return await this.causaService.delete(causaId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: CausaDto): CausaEntity {
        const causa = new CausaEntity();
        causa.nombre = dto.nombre;
        causa.descripcion = dto.descripcion;
        causa.imagen = dto.imagen;
        causa.perfilCreador = { id: dto.perfilCreadorId } as any;
        causa.perfilReceptor = { id: dto.perfilReceptorId } as any;
        return causa;
    }
}