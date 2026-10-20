/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.service.ts */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly jwtService: JwtService
    ) {}

    async login(idUniandes: string, contrasenia: string) {
        const usuario = await this.usuarioService.validarCredenciales(idUniandes, contrasenia);

        const payload = { sub: usuario.id, idUniandes: usuario.idUniandes };
        const token = await this.jwtService.signAsync(payload);

        const { contrasenia: _omit, ...usuarioSinContrasenia } = usuario;

        return {
            access_token: token,
            usuario: usuarioSinContrasenia,
        };
    }
}