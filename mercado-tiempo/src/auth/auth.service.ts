/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.service.ts */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { UsuarioService } from '../usuario/usuario.service';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';

// --- Lo que el frontend necesita saber de quien inició sesión ---
export interface SesionUsuario {
    usuario: Omit<UsuarioEntity, 'contrasenia'>;
    perfil: PerfilMiembroEntity | null;   // null = todavía no ha creado su perfil (ir al Onboarding)
    esModerador: boolean;
}

@Injectable()
export class AuthService {
    constructor(
        private readonly usuarioService: UsuarioService,
        private readonly jwtService: JwtService,

        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ModeradorEntity)
        private readonly moderadorRepository: Repository<ModeradorEntity>
    ) {}

    // Valida las credenciales y devuelve el token junto con el usuario, su perfil y si es moderador
    async login(idUniandes: string, contrasenia: string): Promise<SesionUsuario & { access_token: string }> {
        const usuario = await this.usuarioService.validarCredenciales(idUniandes, contrasenia);

        const payload = { sub: usuario.id, idUniandes: usuario.idUniandes };
        const token = await this.jwtService.signAsync(payload);

        return {
            access_token: token,
            ...(await this.sesion(usuario.id)),
        };
    }

    // Datos de la sesión a partir del id del usuario (el `sub` del token)
    async sesion(usuarioId: string): Promise<SesionUsuario> {
        const usuario = await this.usuarioRepository.findOne({ where: { id: usuarioId } });
        if (!usuario)
            throw new BusinessLogicException("The usuario with the given id was not found", BusinessError.NOT_FOUND);

        const perfil = await this.perfilMiembroRepository.findOne({ where: { usuario: { id: usuarioId } } });
        const moderador = await this.moderadorRepository.findOne({ where: { usuario: { id: usuarioId } } });

        const { contrasenia: _omit, ...usuarioSinContrasenia } = usuario;
        return {
            usuario: usuarioSinContrasenia,
            perfil: perfil ?? null,
            esModerador: !!moderador,
        };
    }
}
