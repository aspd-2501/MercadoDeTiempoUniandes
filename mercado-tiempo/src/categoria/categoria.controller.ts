/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { CategoriaService } from './categoria.service';
import { CategoriaEntity } from './categoria.entity';
import { CategoriaDto } from './categoria.dto';

@Controller('categorias')
@UseInterceptors(BusinessErrorsInterceptor)
export class CategoriaController {
    constructor(private readonly categoriaService: CategoriaService) {}

    @Get()
    async findAll() {
        return await this.categoriaService.findAll();
    }

    @Get(':categoriaId')
    async findOne(@Param('categoriaId') categoriaId: string) {
        return await this.categoriaService.findOne(categoriaId);
    }

    @Post()
    async create(@Body() categoriaDto: CategoriaDto) {
        const categoria: CategoriaEntity = plainToInstance(CategoriaEntity, categoriaDto);
        return await this.categoriaService.create(categoria);
    }

    @Put(':categoriaId')
    async update(@Param('categoriaId') categoriaId: string, @Body() categoriaDto: CategoriaDto) {
        const categoria: CategoriaEntity = plainToInstance(CategoriaEntity, categoriaDto);
        return await this.categoriaService.update(categoriaId, categoria);
    }

    @Delete(':categoriaId')
    @HttpCode(204)
    async delete(@Param('categoriaId') categoriaId: string) {
        return await this.categoriaService.delete(categoriaId);
    }
}