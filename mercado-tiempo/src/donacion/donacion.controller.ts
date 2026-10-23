/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { DonacionService } from './donacion.service';
import { DonacionEntity } from './donacion.entity';
import { DonacionDto } from './donacion.dto';

@Controller('donaciones')
@UseInterceptors(BusinessErrorsInterceptor)
export class DonacionController {
    constructor(private readonly donacionService: DonacionService) {}

    @Get()
    async findAll() {
        return await this.donacionService.findAll();
    }

    @Get(':donacionId')
    async findOne(@Param('donacionId') donacionId: string) {
        return await this.donacionService.findOne(donacionId);
    }

    @Post()
    async create(@Body() donacionDto: DonacionDto) {
        const donacion: DonacionEntity = this.dtoToEntity(donacionDto);
        return await this.donacionService.create(donacion);
    }

    @Delete(':donacionId')
    @HttpCode(204)
    async delete(@Param('donacionId') donacionId: string) {
        return await this.donacionService.delete(donacionId);
    }

    // --- Mapeo manual DTO → Entity (4 FKs opcionales, exactamente una por lado) ---
    private dtoToEntity(dto: DonacionDto): DonacionEntity {
        const donacion = new DonacionEntity();
        donacion.horasDonadas = dto.horasDonadas;
        donacion.fechaDonacion = new Date(dto.fechaDonacion);
        donacion.mensaje = dto.mensaje;
        if (dto.perfilDonanteId) donacion.perfilDonante = { id: dto.perfilDonanteId } as any;
        if (dto.depositoDonanteId) donacion.depositoDonante = { id: dto.depositoDonanteId } as any;
        if (dto.perfilReceptorId) donacion.perfilReceptor = { id: dto.perfilReceptorId } as any;
        if (dto.depositoReceptorId) donacion.depositoReceptor = { id: dto.depositoReceptorId } as any;
        if (dto.causaId) donacion.causa = { id: dto.causaId } as any;
        return donacion;
    }
}