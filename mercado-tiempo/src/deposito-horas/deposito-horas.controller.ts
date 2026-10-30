/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { DepositoHorasService } from './deposito-horas.service';
import { DepositoHorasEntity } from './deposito-horas.entity';
import { DepositoHorasDto } from './deposito-horas.dto';

@Controller('depositos-horas')
@UseInterceptors(BusinessErrorsInterceptor)
export class DepositoHorasController {
    constructor(private readonly depositoHorasService: DepositoHorasService) {}

    @Get()
    async findAll() {
        return await this.depositoHorasService.findAll();
    }

    // Debe ir antes de ':depositoId' para que "fondo" no se lea como un id
    @Get('fondo')
    async findFondo() {
        return await this.depositoHorasService.findFondo();
    }

    @Get(':depositoId')
    async findOne(@Param('depositoId') depositoId: string) {
        return await this.depositoHorasService.findOne(depositoId);
    }

    @Post()
    async create(@Body() depositoDto: DepositoHorasDto) {
        const deposito: DepositoHorasEntity = plainToInstance(DepositoHorasEntity, depositoDto);
        return await this.depositoHorasService.create(deposito);
    }

    @Delete(':depositoId')
    @HttpCode(204)
    async delete(@Param('depositoId') depositoId: string) {
        return await this.depositoHorasService.delete(depositoId);
    }
}
