/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/busqueda.controller.ts */
import { Controller, Get, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { BusquedaService, TipoPostBusqueda } from './busqueda.service';
import { OptionalJwtAuthGuard } from '../auth/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

@Controller('buscar')
@UseInterceptors(BusinessErrorsInterceptor)
export class BusquedaController {
    constructor(private readonly busquedaService: BusquedaService) {}

    // GET /buscar/miembros?q=calculo
    // Si llega el token (Authorization: Bearer), el miembro con la sesión abierta no aparece en los resultados.
    // `excluir=<perfilId>` sigue funcionando para excluir otro perfil.
    @Get('miembros')
    @UseGuards(OptionalJwtAuthGuard)
    async buscarMiembros(@Query('q') q?: string, @Query('excluir') excluir?: string, @CurrentUser() usuario?: JwtPayload) {
        return await this.busquedaService.buscarMiembros(q, excluir, usuario?.sub);
    }

    // GET /buscar/posts-ayuda?q=excel&tipo=solicitud|ofrecimiento
    @Get('posts-ayuda')
    async buscarPostsAyuda(@Query('q') q?: string, @Query('tipo') tipo?: TipoPostBusqueda) {
        if (tipo && !Object.values(TipoPostBusqueda).includes(tipo))
            throw new BusinessLogicException("El tipo debe ser solicitud u ofrecimiento", BusinessError.BAD_REQUEST);
        return await this.busquedaService.buscarPostsAyuda(q, tipo);
    }

    // GET /buscar/servicios?q=fotografia
    // Posts que ofrecen ayuda y servicios de organizaciones (no los servicios de perfiles individuales)
    @Get('servicios')
    async buscarServicios(@Query('q') q?: string) {
        return await this.busquedaService.buscarServicios(q);
    }
}
