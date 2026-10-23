/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { ServicioOfrecidoDto } from './servicio-ofrecido.dto';
import { CrearServicioOfrecidoDto } from './crear-servicio-ofrecido.dto';
import { AsociarCategoriasDto } from './asociar-categorias.dto';

@Controller('servicios-ofrecidos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ServicioOfrecidoController {
    constructor(private readonly servicioOfrecidoService: ServicioOfrecidoService) {}

    @Get()
    async findAll() {
        return await this.servicioOfrecidoService.findAll();
    }

    @Get(':servicioId')
    async findOne(@Param('servicioId') servicioId: string) {
        return await this.servicioOfrecidoService.findOne(servicioId);
    }

    @Post()
    async create(@Body() dto: CrearServicioOfrecidoDto) {
        const servicio: ServicioOfrecidoEntity = this.dtoToEntity(dto);
        return await this.servicioOfrecidoService.create(servicio, dto.categoriaIds);
    }

    @Put(':servicioId')
    async update(@Param('servicioId') servicioId: string, @Body() dto: ServicioOfrecidoDto) {
        const servicio: ServicioOfrecidoEntity = this.dtoToEntity(dto);
        return await this.servicioOfrecidoService.update(servicioId, servicio);
    }

    @Delete(':servicioId')
    @HttpCode(204)
    async delete(@Param('servicioId') servicioId: string) {
        return await this.servicioOfrecidoService.delete(servicioId);
    }

    // --- Categorías (1 a 3) ---

    @Get(':servicioId/categorias')
    async findCategoriasByServicioId(@Param('servicioId') servicioId: string) {
        return await this.servicioOfrecidoService.findCategoriasByServicioId(servicioId);
    }

    @Put(':servicioId/categorias')
    async associateCategoriasServicio(@Param('servicioId') servicioId: string, @Body() dto: AsociarCategoriasDto) {
        return await this.servicioOfrecidoService.associateCategoriasServicio(servicioId, dto.categoriaIds);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: ServicioOfrecidoDto): ServicioOfrecidoEntity {
        const servicio = new ServicioOfrecidoEntity();
        servicio.titulo = dto.titulo;
        servicio.descripcion = dto.descripcion;
        servicio.visible = dto.visible ?? true;
        servicio.perfil = { id: dto.perfilId } as any;
        return servicio;
    }
}