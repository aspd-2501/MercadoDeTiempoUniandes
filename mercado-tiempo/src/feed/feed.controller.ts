/* eslint-disable prettier/prettier */
/* archivo: src/feed/feed.controller.ts */
import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { FeedService } from './feed.service';

@Controller('feed')
@UseInterceptors(BusinessErrorsInterceptor)
export class FeedController {
    constructor(private readonly feedService: FeedService) {}

    // GET /feed?perfilId=<miembro>&categoria=Académico&q=excel&pagina=1&tamano=10
    @Get()
    async findFeed(
        @Query('perfilId') perfilId?: string,
        @Query('categoria') categoria?: string,
        @Query('q') q?: string,
        @Query('pagina') pagina?: string,
        @Query('tamano') tamano?: string
    ) {
        return await this.feedService.findFeed({
            perfilId: perfilId || undefined,
            categoria: categoria && categoria !== 'Todo' ? categoria : undefined,
            q,
            pagina: pagina !== undefined ? Number(pagina) : undefined,
            tamano: tamano !== undefined ? Number(tamano) : undefined,
        });
    }
}
