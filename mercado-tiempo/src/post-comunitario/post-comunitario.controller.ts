/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PostComunitarioService } from './post-comunitario.service';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { PostComunitarioDto } from './post-comunitario.dto';
import { CrearPostComunitarioDto } from './crear-post-comunitario.dto';

@Controller('posts-comunitarios')
@UseInterceptors(BusinessErrorsInterceptor)
export class PostComunitarioController {
    constructor(private readonly postComunitarioService: PostComunitarioService) {}

    @Get()
    async findAll() {
        return await this.postComunitarioService.findAll();
    }

    @Get(':postId')
    async findOne(@Param('postId') postId: string) {
        return await this.postComunitarioService.findOne(postId);
    }

    @Post()
    async create(@Body() dto: CrearPostComunitarioDto) {
        const post: PostComunitarioEntity = this.dtoToEntity(dto);
        return await this.postComunitarioService.create(post, dto.perfilIds);
    }

    @Put(':postId')
    async update(@Param('postId') postId: string, @Body() dto: PostComunitarioDto) {
        const post: PostComunitarioEntity = this.dtoToEntity(dto);
        return await this.postComunitarioService.update(postId, post);
    }

    @Delete(':postId')
    @HttpCode(204)
    async delete(@Param('postId') postId: string) {
        return await this.postComunitarioService.delete(postId);
    }

    // --- Relación con PerfilMiembro (vía UsuarioPost) ---

    @Post(':postId/participantes/:perfilId')
    async addParticipantePost(@Param('postId') postId: string, @Param('perfilId') perfilId: string) {
        return await this.postComunitarioService.addParticipantePost(postId, perfilId);
    }

    @Get(':postId/participantes')
    async findParticipantesByPostId(@Param('postId') postId: string) {
        return await this.postComunitarioService.findParticipantesByPostId(postId);
    }

    @Delete(':postId/participantes/:perfilId')
    @HttpCode(204)
    async deleteParticipantePost(@Param('postId') postId: string, @Param('perfilId') perfilId: string) {
        return await this.postComunitarioService.deleteParticipantePost(postId, perfilId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: PostComunitarioDto): PostComunitarioEntity {
        const post = new PostComunitarioEntity();
        post.titulo = dto.titulo;
        post.descripcion = dto.descripcion;
        post.imagen = dto.imagen;
        post.fechaCreacion = new Date(dto.fechaCreacion);
        if (dto.likes !== undefined) post.likes = dto.likes;
        return post;
    }
}