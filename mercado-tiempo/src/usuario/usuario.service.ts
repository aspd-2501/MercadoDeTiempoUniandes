/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { UsuarioEntity } from './usuario.entity';

const SALT_ROUNDS = 10;

@Injectable()
export class UsuarioService {
    constructor(
        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>
    ) {}

    async findAll(): Promise<UsuarioEntity[]> {
        return await this.usuarioRepository.find();
    }

    async findOne(id: string): Promise<UsuarioEntity> {
        const usuario: UsuarioEntity | null = await this.usuarioRepository.findOne({ where: { id } });
        if (!usuario)
            throw new BusinessLogicException("No se encontró el usuario", BusinessError.NOT_FOUND);
        return usuario;
    }

    async create(usuario: UsuarioEntity): Promise<UsuarioEntity> {
        if (!usuario.idUniandes)
            throw new BusinessLogicException("Debes indicar tu usuario Uniandes", BusinessError.PRECONDITION_FAILED);

        const existente = await this.usuarioRepository.findOne({ where: { idUniandes: usuario.idUniandes } });
        if (existente)
            throw new BusinessLogicException("Ya existe una cuenta con ese usuario Uniandes", BusinessError.PRECONDITION_FAILED);

        if (!usuario.contrasenia || usuario.contrasenia.length < 6)
            throw new BusinessLogicException("La contraseña debe tener al menos 6 caracteres", BusinessError.PRECONDITION_FAILED);

        usuario.contrasenia = await bcrypt.hash(usuario.contrasenia, SALT_ROUNDS);

        return await this.usuarioRepository.save(usuario);
    }

    async update(id: string, usuario: UsuarioEntity): Promise<UsuarioEntity> {
        const persisted: UsuarioEntity | null = await this.usuarioRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("No se encontró el usuario", BusinessError.NOT_FOUND);

        if (usuario.contrasenia && usuario.contrasenia !== persisted.contrasenia) {
            if (usuario.contrasenia.length < 6)
                throw new BusinessLogicException("La contraseña debe tener al menos 6 caracteres", BusinessError.PRECONDITION_FAILED);
            usuario.contrasenia = await bcrypt.hash(usuario.contrasenia, SALT_ROUNDS);
        } else {
            usuario.contrasenia = persisted.contrasenia;
        }

        usuario.id = id;
        return await this.usuarioRepository.save(usuario);
    }

    async delete(id: string) {
        const usuario: UsuarioEntity | null = await this.usuarioRepository.findOne({ where: { id } });
        if (!usuario)
            throw new BusinessLogicException("No se encontró el usuario", BusinessError.NOT_FOUND);
        await this.usuarioRepository.remove(usuario);
    }

    async validarCredenciales(idUniandes: string, contrasenia: string): Promise<UsuarioEntity> {
        const usuario: UsuarioEntity | null = await this.usuarioRepository.findOne({ where: { idUniandes } });
        if (!usuario)
            throw new BusinessLogicException("Usuario o contraseña incorrectos", BusinessError.NOT_FOUND);

        const esValida = await bcrypt.compare(contrasenia, usuario.contrasenia);
        if (!esValida)
            throw new BusinessLogicException("Usuario o contraseña incorrectos", BusinessError.NOT_FOUND);

        return usuario;
    }
}