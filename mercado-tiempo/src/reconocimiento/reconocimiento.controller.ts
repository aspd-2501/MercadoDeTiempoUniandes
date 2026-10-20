/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { ReconocimientoService } from './reconocimiento.service';
import { ReconocimientoEntity } from './reconocimiento.entity';
import { ReconocimientoDto } from './reconocimiento.dto';
import { OtorgarReconocimientoDto } from './otorgar-reconocimiento.dto';

@Controller('reconocimientos')
@UseInterceptors(BusinessErrorsInterceptor)
export class ReconocimientoController {
    constructor(private readonly reconocimientoService: ReconocimientoService) {}

    @Get()
    async findAll() {
        return await this.reconocimientoService.findAll();
    }

    @Get(':reconocimientoId')
    async findOne(@Param('reconocimientoId') reconocimientoId: string) {
        return await this.reconocimientoService.findOne(reconocimientoId);
    }

    @Post()
    async create(@Body() dto: ReconocimientoDto) {
        const reconocimiento: ReconocimientoEntity = plainToInstance(ReconocimientoEntity, dto);
        return await this.reconocimientoService.create(reconocimiento);
    }

    @Put(':reconocimientoId')
    async update(@Param('reconocimientoId') reconocimientoId: string, @Body() dto: ReconocimientoDto) {
        const reconocimiento: ReconocimientoEntity = plainToInstance(ReconocimientoEntity, dto);
        return await this.reconocimientoService.update(reconocimientoId, reconocimiento);
    }

    @Delete(':reconocimientoId')
    @HttpCode(204)
    async delete(@Param('reconocimientoId') reconocimientoId: string) {
        return await this.reconocimientoService.delete(reconocimientoId);
    }

    @Post(':reconocimientoId/otorgar')
    async otorgarReconocimiento(@Param('reconocimientoId') reconocimientoId: string, @Body() dto: OtorgarReconocimientoDto) {
        return await this.reconocimientoService.otorgarReconocimiento(
            reconocimientoId,
            dto.perfilReceptorId,
            dto.perfilOtorganteId,
            dto.postComunitarioId
        );
    }

    @Get('perfiles/:perfilId/otorgamientos')
    async findOtorgamientosByPerfilReceptorId(@Param('perfilId') perfilId: string) {
        return await this.reconocimientoService.findOtorgamientosByPerfilReceptorId(perfilId);
    }
}