/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PerfilMiembroService } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { PerfilMiembroDto } from './perfil-miembro.dto';

@Controller('perfiles-miembro')
@UseInterceptors(BusinessErrorsInterceptor)
export class PerfilMiembroController {
    constructor(private readonly perfilMiembroService: PerfilMiembroService) {}

    @Get()
    async findAll() {
        return await this.perfilMiembroService.findAll();
    }

    @Get(':perfilId')
    async findOne(@Param('perfilId') perfilId: string) {
        return await this.perfilMiembroService.findOne(perfilId);
    }

    @Post()
    async create(@Body() perfilDto: PerfilMiembroDto) {
        const perfil: PerfilMiembroEntity = this.dtoToEntity(perfilDto);
        return await this.perfilMiembroService.create(perfil);
    }

    @Put(':perfilId')
    async update(@Param('perfilId') perfilId: string, @Body() perfilDto: PerfilMiembroDto) {
        const perfil: PerfilMiembroEntity = this.dtoToEntity(perfilDto);
        return await this.perfilMiembroService.update(perfilId, perfil);
    }

    @Delete(':perfilId')
    @HttpCode(204)
    async delete(@Param('perfilId') perfilId: string) {
        return await this.perfilMiembroService.delete(perfilId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: PerfilMiembroDto): PerfilMiembroEntity {
        const perfil = new PerfilMiembroEntity();
        perfil.imagen = dto.imagen;
        perfil.descripcion = dto.descripcion;
        perfil.intereses = dto.intereses;
        perfil.estadoActividad = dto.estadoActividad;
        perfil.saldo = dto.saldo;
        perfil.usuario = { id: dto.usuarioId } as any;
        return perfil;
    }
}