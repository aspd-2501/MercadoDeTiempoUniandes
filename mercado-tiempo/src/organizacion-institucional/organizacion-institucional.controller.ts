/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { OrganizacionInstitucionalService } from './organizacion-institucional.service';
import { OrganizacionInstitucionalEntity } from './organizacion-institucional.entity';
import { OrganizacionInstitucionalDto } from './organizacion-institucional.dto';

@Controller('organizaciones-institucionales')
@UseInterceptors(BusinessErrorsInterceptor)
export class OrganizacionInstitucionalController {
    constructor(private readonly organizacionInstitucionalService: OrganizacionInstitucionalService) {}

    @Get()
    async findAll() {
        return await this.organizacionInstitucionalService.findAll();
    }

    @Get(':organizacionId')
    async findOne(@Param('organizacionId') organizacionId: string) {
        return await this.organizacionInstitucionalService.findOne(organizacionId);
    }

    @Post()
    async create(@Body() organizacionDto: OrganizacionInstitucionalDto) {
        const organizacion: OrganizacionInstitucionalEntity = plainToInstance(OrganizacionInstitucionalEntity, organizacionDto);
        return await this.organizacionInstitucionalService.create(organizacion);
    }

    @Put(':organizacionId')
    async update(@Param('organizacionId') organizacionId: string, @Body() organizacionDto: OrganizacionInstitucionalDto) {
        const organizacion: OrganizacionInstitucionalEntity = plainToInstance(OrganizacionInstitucionalEntity, organizacionDto);
        return await this.organizacionInstitucionalService.update(organizacionId, organizacion);
    }

    @Delete(':organizacionId')
    @HttpCode(204)
    async delete(@Param('organizacionId') organizacionId: string) {
        return await this.organizacionInstitucionalService.delete(organizacionId);
    }
}