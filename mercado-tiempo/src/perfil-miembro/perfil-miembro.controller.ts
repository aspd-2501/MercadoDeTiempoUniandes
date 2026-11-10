/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { PerfilMiembroService } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { PerfilMiembroDto } from './perfil-miembro.dto';
import { AsociarInteresesDto } from './asociar-intereses.dto';
import { EstadoActividadDto } from './estado-actividad.dto';

@Controller('perfiles-miembro')
@UseInterceptors(BusinessErrorsInterceptor)
export class PerfilMiembroController {
    constructor(private readonly perfilMiembroService: PerfilMiembroService) {}

    @Get()
    async findAll() {
        return await this.perfilMiembroService.findAll();
    }

    // GET /perfiles-miembro/usuario/:usuarioId -> perfil del usuario (404 si aún no lo ha creado)
    @Get('usuario/:usuarioId')
    async findByUsuarioId(@Param('usuarioId') usuarioId: string) {
        const perfil = await this.perfilMiembroService.findByUsuarioId(usuarioId);
        const { contrasenia, ...usuarioSinContrasenia } = perfil.usuario;
        return { ...perfil, usuario: usuarioSinContrasenia };
    }

    @Get(':perfilId')
async findOne(@Param('perfilId') perfilId: string) {
    const perfil = await this.perfilMiembroService.findOne(perfilId);
    if (perfil.usuario) {
        const { contrasenia, ...usuarioSinContrasenia } = perfil.usuario;
        return { ...perfil, usuario: usuarioSinContrasenia };
    }
    return perfil;
}

    @Post()
    async create(@Body() perfilDto: PerfilMiembroDto) {
        const perfil: PerfilMiembroEntity = this.dtoToEntity(perfilDto);
        return await this.perfilMiembroService.create(perfil);
    }

    @Put(':perfilId')
    async update(@Param('perfilId') perfilId: string, @Body() perfilDto: PerfilMiembroDto) {
        const perfil: PerfilMiembroEntity = this.dtoToEntity(perfilDto);
        return await this.perfilMiembroService.update(perfilId, perfil);
    }

    @Delete(':perfilId')
    @HttpCode(204)
    async delete(@Param('perfilId') perfilId: string) {
        return await this.perfilMiembroService.delete(perfilId);
    }

    // --- Intereses (categorías) ---

    // PUT /perfiles-miembro/:perfilId/estado-actividad  { "activo": false }  (RF-006)
    @Put(':perfilId/estado-actividad')
    async cambiarEstadoActividad(@Param('perfilId') perfilId: string, @Body() dto: EstadoActividadDto) {
        const perfil = await this.perfilMiembroService.cambiarEstadoActividad(perfilId, dto.activo);
        if (perfil.usuario) {
            const { contrasenia, ...usuarioSinContrasenia } = perfil.usuario;
            return { ...perfil, usuario: usuarioSinContrasenia };
        }
        return perfil;
    }

    @Get(':perfilId/intereses')
    async findIntereses(@Param('perfilId') perfilId: string) {
        return await this.perfilMiembroService.findInteresesByPerfilId(perfilId);
    }

    @Put(':perfilId/intereses')
    async associateIntereses(@Param('perfilId') perfilId: string, @Body() dto: AsociarInteresesDto) {
        return await this.perfilMiembroService.associateInteresesPerfil(perfilId, dto.categoriaIds);
    }

    @Delete(':perfilId/intereses/:categoriaId')
    @HttpCode(204)
    async deleteInteres(@Param('perfilId') perfilId: string, @Param('categoriaId') categoriaId: string) {
        return await this.perfilMiembroService.deleteInteresPerfil(perfilId, categoriaId);
    }

    // --- Mapeo manual DTO → Entity ---
    private dtoToEntity(dto: PerfilMiembroDto): PerfilMiembroEntity {
        const perfil = new PerfilMiembroEntity();
        perfil.nombre = dto.nombre;
        perfil.edad = dto.edad;
        perfil.afiliacionUniandes = dto.afiliacionUniandes;
        perfil.imagen = dto.imagen;
        perfil.descripcion = dto.descripcion;
        perfil.estadoActividad = dto.estadoActividad;
        perfil.saldo = dto.saldo;
        perfil.usuario = { id: dto.usuarioId } as any;
        return perfil;
    }
}