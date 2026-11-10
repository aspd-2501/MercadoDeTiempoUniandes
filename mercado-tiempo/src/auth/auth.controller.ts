/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.controller.ts */
import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import type { JwtPayload } from './jwt.strategy';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    // POST /auth/login -> { access_token, usuario, perfil, esModerador }
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto.idUniandes, dto.contrasenia);
    }

    // GET /auth/me con el encabezado "Authorization: Bearer <access_token>"
    // -> { usuario, perfil, esModerador }. Sirve para recuperar la sesión al recargar la página.
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@CurrentUser() usuario: JwtPayload) {
        return await this.authService.sesion(usuario.sub);
    }
}
