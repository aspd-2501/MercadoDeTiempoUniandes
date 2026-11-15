/* eslint-disable prettier/prettier */
/* archivo: src/feed/feed.controller.ts */
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { FeedService, TipoPublicacion } from './feed.service';

@Controller('feed')
@UseInterceptors(BusinessErrorsInterceptor)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    // GET /feed?perfilId=<miembro>&categoria=Académico&q=excel&tamano=10
    // Scroll infinito: la respuesta trae `siguienteCursor`; para la siguiente tanda se envía como
    // GET /feed?...&despues=<siguienteCursor>. (`pagina` sigue funcionando, pero puede repetir publicaciones
    // si se publican nuevas mientras el miembro baja por el feed.)
    // Sin `tipos` trae posts de ayuda y posts comunitarios. Para incluir causas:
    // GET /feed?tipos=POST_AYUDA,POST_COMUNITARIO,CAUSA
    @Get()
    async findFeed(
        @Query('perfilId') perfilId?: string,
        @Query('categoria') categoria?: string,
        @Query('q') q?: string,
        @Query('pagina') pagina?: string,
        @Query('tamano') tamano?: string,
        @Query('tipos') tipos?: string,
        @Query('despues') despues?: string
    ) {
        return await this.feedService.findFeed({
            perfilId: perfilId || undefined,
            categoria: categoria && categoria !== 'Todo' ? categoria : undefined,
            q,
            pagina: pagina !== undefined ? Number(pagina) : undefined,
            tamano: tamano !== undefined ? Number(tamano) : undefined,
            despues: despues || undefined,
            tipos: tipos ? tipos.split(',').map(t => t.trim().toUpperCase() as TipoPublicacion).filter(t => t) : undefined,
        });
    }
}
