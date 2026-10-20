/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/actividad-comunitaria.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ActividadComunitariaService } from './actividad-comunitaria.service';
import { ActividadComunitariaEntity } from './actividad-comunitaria.entity';
import { ActividadComunitariaDto } from './actividad-comunitaria.dto';
import { AsociarPerfilesDto } from './asociar-perfiles.dto';

@Controller('actividades')
@UseInterceptors(BusinessErrorsInterceptor)
export class ActividadComunitariaController {
    constructor(private readonly actividadComunitariaService: ActividadComunitariaService) {}

    @Get()
    async findAll() {
        return await this.actividadComunitariaService.findAll();
    }

    @Get(':actividadId')
    async findOne(@Param('actividadId') actividadId: string) {
        return await this.actividadComunitariaService.findOne(actividadId);
    }

    @Post()
    async create(@Body() actividadDto: ActividadComunitariaDto) {
        const actividad: ActividadComunitariaEntity = this.dtoToEntity(actividadDto);
        return await this.actividadComunitariaService.create(actividad);
    }

    @Put(':actividadId')
    async update(@Param('actividadId') actividadId: string, @Body() actividadDto: ActividadComunitariaDto) {
        const actividad: ActividadComunitariaEntity = this.dtoToEntity(actividadDto);
        return await this.actividadComunitariaService.update(actividadId, actividad);
    }

    @Delete(':actividadId')
    @HttpCode(204)
    async delete(@Param('actividadId') actividadId: string) {
        return await this.actividadComunitariaService.delete(actividadId);
    }

    // --- Relación con PerfilMiembro (vía InscripcionActividad) ---

    @Post(':actividadId/perfiles/:perfilId')
    async addPerfilActividad(@Param('actividadId') actividadId: string, @Param('perfilId') perfilId: string) {
        return await this.actividadComunitariaService.addPerfilActividad(actividadId, perfilId);
    }

    @Get(':actividadId/perfiles/:perfilId')
    async findPerfilByActividadIdPerfilId(@Param('actividadId') actividadId: string, @Param('perfilId') perfilId: string) {
        return await this.actividadComunitariaService.findPerfilByActividadIdPerfilId(actividadId, perfilId);
    }

    @Get(':actividadId/perfiles')
    async findPerfilesByActividadId(@Param('actividadId') actividadId: string) {
        return await this.actividadComunitariaService.findPerfilesByActividadId(actividadId);
    }

    @Put(':actividadId/perfiles')
    async associatePerfilesActividad(@Param('actividadId') actividadId: string, @Body() dto: AsociarPerfilesDto) {
        const perfiles = dto.perfilIds.map(id => ({ id })) as any;
        return await this.actividadComunitariaService.associatePerfilesActividad(actividadId, perfiles);
    }

    @Delete(':actividadId/perfiles/:perfilId')
    @HttpCode(204)
    async deletePerfilActividad(@Param('actividadId') actividadId: string, @Param('perfilId') perfilId: string) {
        return await this.actividadComunitariaService.deletePerfilActividad(actividadId, perfilId);
    }

    // --- Mapeo manual DTO → Entity, porque organizacionId no es una columna directa ---
    private dtoToEntity(dto: ActividadComunitariaDto): ActividadComunitariaEntity {
        const actividad = new ActividadComunitariaEntity();
        actividad.titulo = dto.titulo;
        actividad.descripcion = dto.descripcion;
        actividad.imagen = dto.imagen;
        actividad.cupo = dto.cupo;
        actividad.cupoLleno = dto.cupoLleno;
        actividad.fechaCreacion = new Date(dto.fechaCreacion);
        actividad.organizacion = { id: dto.organizacionId } as any;
        return actividad;
    }
}