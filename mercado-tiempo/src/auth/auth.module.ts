/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.module.ts */
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsuarioModule } from '../usuario/usuario.module';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';

@Module({
    imports: [
        UsuarioModule,
        TypeOrmModule.forFeature([UsuarioEntity, PerfilMiembroEntity, ModeradorEntity]),
        PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET ?? 'cambia-esto-en-produccion',
            signOptions: { expiresIn: '24h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
})
export class AuthModule {}