/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/posts-comunitarios-del-perfil.controller.ts */
import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PostComunitarioService } from './post-comunitario.service';

// Posts comunitarios creados por un miembro
@Controller('perfiles-miembro')
@UseInterceptors(BusinessErrorsInterceptor)
export class PostsComunitariosDelPerfilController {
    constructor(private readonly postComunitarioService: PostComunitarioService) {}

    // GET /perfiles-miembro/:perfilId/posts-comunitarios
    @Get(':perfilId/posts-comunitarios')
    async findPostsComunitarios(@Param('perfilId') perfilId: string) {
        return await this.postComunitarioService.findByCreador(perfilId);
    }
}
