/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PerfilOrganizacionService } from './perfil-organizacion.service';
import { PerfilOrganizacionEntity } from './perfil-organizacion.entity';
import { PerfilOrganizacionDto } from './perfil-organizacion.dto';

@Controller('perfiles-organizacion')
@UseInterceptors(BusinessErrorsInterceptor)
export class PerfilOrganizacionController {
    constructor(private readonly perfilOrganizacionService: PerfilOrganizacionService) {}

    @Get()
    async findAll() {
        return await this.perfilOrganizacionService.findAll();
    }

    @Get(':organizacionId')
    async findOne(@Param('organizacionId') organizacionId: string) {
        return await this.perfilOrganizacionService.findOne(organizacionId);
    }

    @Post()
    async create(@Body() dto: PerfilOrganizacionDto) {
        const organizacion = new PerfilOrganizacionEntity();
        organizacion.perfil = { id: dto.perfilId } as any;
        return await this.perfilOrganizacionService.create(organizacion);
    }

    @Delete(':organizacionId')
    @HttpCode(204)
    async delete(@Param('organizacionId') organizacionId: string) {
        return await this.perfilOrganizacionService.delete(organizacionId);
    }

    // --- Relación con PerfilMiembro (vía MiembroOrganizacion) ---

    @Post(':organizacionId/miembros/:perfilId')
    async addMiembroOrganizacion(@Param('organizacionId') organizacionId: string, @Param('perfilId') perfilId: string) {
        return await this.perfilOrganizacionService.addMiembroOrganizacion(organizacionId, perfilId);
    }

    @Get(':organizacionId/miembros')
    async findMiembrosByOrganizacionId(@Param('organizacionId') organizacionId: string) {
        return await this.perfilOrganizacionService.findMiembrosByOrganizacionId(organizacionId);
    }

    @Delete(':organizacionId/miembros/:perfilId')
    @HttpCode(204)
    async deleteMiembroOrganizacion(@Param('organizacionId') organizacionId: string, @Param('perfilId') perfilId: string) {
        return await this.perfilOrganizacionService.deleteMiembroOrganizacion(organizacionId, perfilId);
    }
}