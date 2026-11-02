/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, Query, UseInterceptors } from '@nestjs/common';
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
        servicio.imagen = dto.imagen ?? null;
        servicio.visible = dto.visible ?? true;
        servicio.perfil = { id: dto.perfilId } as any;
        return servicio;
    }
}

// --- Servicios de un miembro, para su perfil (RF-008) ---
// GET /perfiles-miembro/:perfilId/servicios-ofrecidos            -> solo los visibles
// GET /perfiles-miembro/:perfilId/servicios-ofrecidos?ocultos=true -> también los ocultos (vista del propio miembro)
@Controller('perfiles-miembro/:perfilId/servicios-ofrecidos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ServiciosPerfilController {
    constructor(private readonly servicioOfrecidoService: ServicioOfrecidoService) {}

    @Get()
    async findByPerfilId(@Param('perfilId') perfilId: string, @Query('ocultos') ocultos?: string) {
        return await this.servicioOfrecidoService.findByPerfilId(perfilId, ocultos === 'true');
    }
}
