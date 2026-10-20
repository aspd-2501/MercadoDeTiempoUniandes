/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ServicioPotencialService } from './servicio-potencial.service';
import { ServicioPotencialEntity } from './servicio-potencial.entity';
import { CrearServicioPotencialDto } from './crear-servicio-potencial.dto';
import { AsociarCategoriasDto } from './asociar-categorias.dto';

@Controller('servicios-potenciales')
@UseInterceptors(BusinessErrorsInterceptor)
export class ServicioPotencialController {
    constructor(private readonly servicioPotencialService: ServicioPotencialService) {}

    @Get()
    async findAll() {
        return await this.servicioPotencialService.findAll();
    }

    @Get(':servicioId')
    async findOne(@Param('servicioId') servicioId: string) {
        return await this.servicioPotencialService.findOne(servicioId);
    }

    @Post()
    async create(@Body() dto: CrearServicioPotencialDto) {
        const servicio = new ServicioPotencialEntity();
        servicio.perfil = { id: dto.perfilId } as any;
        return await this.servicioPotencialService.create(servicio, dto.categoriaIds);
    }

    @Delete(':servicioId')
    @HttpCode(204)
    async delete(@Param('servicioId') servicioId: string) {
        return await this.servicioPotencialService.delete(servicioId);
    }

    // --- Categorías (1 a 3) ---

    @Get(':servicioId/categorias')
    async findCategoriasByServicioId(@Param('servicioId') servicioId: string) {
        return await this.servicioPotencialService.findCategoriasByServicioId(servicioId);
    }

    @Put(':servicioId/categorias')
    async associateCategoriasServicio(@Param('servicioId') servicioId: string, @Body() dto: AsociarCategoriasDto) {
        return await this.servicioPotencialService.associateCategoriasServicio(servicioId, dto.categoriaIds);
    }
}