/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.controller.ts */
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './login.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    async login(@Body() dto: LoginDto) {
        return await this.authService.login(dto.idUniandes, dto.contrasenia);
    }
}