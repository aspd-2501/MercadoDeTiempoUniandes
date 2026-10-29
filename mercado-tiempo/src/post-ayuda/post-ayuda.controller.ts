/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/post-ayuda.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PostAyudaService } from './post-ayuda.service';
import { PostAyudaEntity } from './post-ayuda.entity';
import { PostAyudaDto } from './post-ayuda.dto';
import { CrearPostAyudaDto } from './crear-post-ayuda.dto';
import { AsociarCategoriasDto } from './asociar-categorias.dto';
import { FranjaHorariaDto } from './franja-horaria.dto';

@Controller('posts-ayuda')
@UseInterceptors(BusinessErrorsInterceptor)
export class PostAyudaController {
    constructor(private readonly postAyudaService: PostAyudaService) {}

    @Get()
    async findAll() {
        return await this.postAyudaService.findAll();
    }

    @Get(':postId')
    async findOne(@Param('postId') postId: string) {
        return await this.postAyudaService.findOne(postId);
    }

        @Post()
    async create(@Body() dto: CrearPostAyudaDto) {
        const post: PostAyudaEntity = this.dtoToEntity(dto);
        const horarios = dto.horarios.map(f => ({ fechaInicio: new Date(f.fechaInicio), fechaFin: new Date(f.fechaFin) }));
        return await this.postAyudaService.create(post, dto.categoriaIds, horarios);
    }

    @Put(':postId')
    async update(@Param('postId') postId: string, @Body() dto: PostAyudaDto) {
        const post: PostAyudaEntity = this.dtoToEntity(dto);
        return await this.postAyudaService.update(postId, post);
    }

    @Delete(':postId')
    @HttpCode(204)
    async delete(@Param('postId') postId: string) {
        return await this.postAyudaService.delete(postId);
    }

    // --- Horarios disponibles (RF-036) ---

    @Get(':postId/horarios')
    async findHorariosByPostId(@Param('postId') postId: string) {
        return await this.postAyudaService.findHorariosByPostId(postId);
    }

    @Post(':postId/horarios')
    async addHorarioPost(@Param('postId') postId: string, @Body() dto: FranjaHorariaDto) {
        const franja = { fechaInicio: new Date(dto.fechaInicio), fechaFin: new Date(dto.fechaFin) };
        return await this.postAyudaService.addHorarioPost(postId, franja);
    }

    @Delete(':postId/horarios/:horarioId')
    @HttpCode(204)
    async deleteHorarioPost(@Param('postId') postId: string, @Param('horarioId') horarioId: string) {
        return await this.postAyudaService.deleteHorarioPost(postId, horarioId);
    }

    // --- Categorías (1 a 3) ---

    @Get(':postId/categorias')
    async findCategoriasByPostId(@Param('postId') postId: string) {
        return await this.postAyudaService.findCategoriasByPostId(postId);
    }

    @Put(':postId/categorias')
    async associateCategoriasPost(@Param('postId') postId: string, @Body() dto: AsociarCategoriasDto) {
        return await this.postAyudaService.associateCategoriasPost(postId, dto.categoriaIds);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: PostAyudaDto): PostAyudaEntity {
        const post = new PostAyudaEntity();
        post.titulo = dto.titulo;
        post.descripcion = dto.descripcion;
        post.horas = dto.horas;
        post.imagen = dto.imagen;
        post.ofrece = dto.ofrece;
        post.cupo = dto.cupo;
        post.cupoLleno = dto.cupoLleno;
        post.fechaCreacion = new Date(dto.fechaCreacion);
        post.perfilAutor = { id: dto.perfilAutorId } as any;
        return post;
    }
}