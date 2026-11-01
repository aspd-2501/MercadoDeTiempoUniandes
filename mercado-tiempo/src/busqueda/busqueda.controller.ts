/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/busqueda.controller.ts */
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { BusquedaService, TipoPostBusqueda } from './busqueda.service';

@Controller('buscar')
@UseInterceptors(BusinessErrorsInterceptor)
export class BusquedaController {
    constructor(private readonly busquedaService: BusquedaService) {}

    // GET /buscar/miembros?q=calculo&excluir=<perfilId del miembro autenticado>
    @Get('miembros')
    async buscarMiembros(@Query('q') q?: string, @Query('excluir') excluir?: string) {
        return await this.busquedaService.buscarMiembros(q, excluir);
    }

    // GET /buscar/posts-ayuda?q=excel&tipo=solicitud|ofrecimiento
    @Get('posts-ayuda')
    async buscarPostsAyuda(@Query('q') q?: string, @Query('tipo') tipo?: TipoPostBusqueda) {
        if (tipo && !Object.values(TipoPostBusqueda).includes(tipo))
            throw new BusinessLogicException("The tipo must be solicitud or ofrecimiento", BusinessError.BAD_REQUEST);
        return await this.busquedaService.buscarPostsAyuda(q, tipo);
    }

    // GET /buscar/servicios?q=fotografia
    @Get('servicios')
    async buscarServicios(@Query('q') q?: string) {
        return await this.busquedaService.buscarServicios(q);
    }
}
