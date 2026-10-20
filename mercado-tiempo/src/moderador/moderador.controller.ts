/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ModeradorService } from './moderador.service';
import { ModeradorEntity } from './moderador.entity';
import { ModeradorDto } from './moderador.dto';

@Controller('moderadores')
@UseInterceptors(BusinessErrorsInterceptor)
export class ModeradorController {
    constructor(private readonly moderadorService: ModeradorService) {}

    @Get()
    async findAll() {
        return await this.moderadorService.findAll();
    }

    @Get(':moderadorId')
    async findOne(@Param('moderadorId') moderadorId: string) {
        return await this.moderadorService.findOne(moderadorId);
    }

    @Post()
    async create(@Body() moderadorDto: ModeradorDto) {
        const moderador: ModeradorEntity = new ModeradorEntity();
        moderador.usuario = { id: moderadorDto.usuarioId } as any;
        return await this.moderadorService.create(moderador);
    }

    @Delete(':moderadorId')
    @HttpCode(204)
    async delete(@Param('moderadorId') moderadorId: string) {
        return await this.moderadorService.delete(moderadorId);
    }
}