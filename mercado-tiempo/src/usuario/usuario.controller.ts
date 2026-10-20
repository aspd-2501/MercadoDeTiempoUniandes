/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.controller.ts */
import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors.interceptor';
import { UsuarioService } from './usuario.service';
import { UsuarioEntity } from './usuario.entity';
import { UsuarioDto } from './usuario.dto';
import { LoginDto } from './login.dto';

@Controller('usuarios')
@UseInterceptors(BusinessErrorsInterceptor)
export class UsuarioController {
    constructor(private readonly usuarioService: UsuarioService) {}

    @Get()
    async findAll() {
        const usuarios = await this.usuarioService.findAll();
        return usuarios.map(u => this.sinContrasenia(u));
    }

    @Get(':usuarioId')
    async findOne(@Param('usuarioId') usuarioId: string) {
        const usuario = await this.usuarioService.findOne(usuarioId);
        return this.sinContrasenia(usuario);
    }

    @Post()
    async create(@Body() usuarioDto: UsuarioDto) {
        const usuario: UsuarioEntity = plainToInstance(UsuarioEntity, usuarioDto);
        const nuevoUsuario = await this.usuarioService.create(usuario);
        return this.sinContrasenia(nuevoUsuario);
    }

    @Put(':usuarioId')
    async update(@Param('usuarioId') usuarioId: string, @Body() usuarioDto: UsuarioDto) {
        const usuario: UsuarioEntity = plainToInstance(UsuarioEntity, usuarioDto);
        const usuarioActualizado = await this.usuarioService.update(usuarioId, usuario);
        return this.sinContrasenia(usuarioActualizado);
    }

    @Delete(':usuarioId')
    @HttpCode(204)
    async delete(@Param('usuarioId') usuarioId: string) {
        return await this.usuarioService.delete(usuarioId);
    }

    @Post('login')
    async login(@Body() dto: LoginDto) {
        const usuario = await this.usuarioService.validarCredenciales(dto.idUniandes, dto.contrasenia);
        return this.sinContrasenia(usuario);
    }

    // --- Elimina la contraseña (hasheada) de la respuesta antes de enviarla al cliente ---
    private sinContrasenia(usuario: UsuarioEntity): Omit<UsuarioEntity, 'contrasenia'> {
        const { contrasenia, ...resto } = usuario;
        return resto;
    }
}