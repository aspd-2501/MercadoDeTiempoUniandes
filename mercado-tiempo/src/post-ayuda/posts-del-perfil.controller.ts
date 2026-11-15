/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/posts-del-perfil.controller.ts */
import { Controller, Get, Param, Query, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PostAyudaService } from './post-ayuda.service';

// Posts de ayuda publicados por un miembro ("Mis posts" con el perfil de la sesión, o el perfil de otro miembro)
@Controller('perfiles-miembro')
@UseInterceptors(BusinessErrorsInterceptor)
export class PostsDelPerfilController {
    constructor(private readonly postAyudaService: PostAyudaService) {}

    // GET /perfiles-miembro/:perfilId/posts-ayuda?tipo=solicitud|ofrecimiento
    @Get(':perfilId/posts-ayuda')
    async findPostsAyuda(@Param('perfilId') perfilId: string, @Query('tipo') tipo?: string) {
        if (tipo && tipo !== 'solicitud' && tipo !== 'ofrecimiento')
            throw new BusinessLogicException("El tipo debe ser solicitud u ofrecimiento", BusinessError.BAD_REQUEST);
        const ofrece = tipo === undefined ? undefined : tipo === 'ofrecimiento';
        return await this.postAyudaService.findByPerfilAutor(perfilId, ofrece);
    }
}
