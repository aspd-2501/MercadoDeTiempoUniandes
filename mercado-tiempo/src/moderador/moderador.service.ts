/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ModeradorEntity } from './moderador.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

@Injectable()
export class ModeradorService {
    constructor(
        @InjectRepository(ModeradorEntity)
        private readonly moderadorRepository: Repository<ModeradorEntity>,

        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>
    ) {}

    async findAll(): Promise<ModeradorEntity[]> {
        return await this.moderadorRepository.find({ relations: { usuario: true } });
    }

    async findOne(id: string): Promise<ModeradorEntity> {
        const moderador: ModeradorEntity | null = await this.moderadorRepository.findOne({
            where: { id },
            relations: { usuario: true }
        });
        if (!moderador)
            throw new BusinessLogicException("The moderador with the given id was not found", BusinessError.NOT_FOUND);
        return moderador;
    }

    async create(moderador: ModeradorEntity): Promise<ModeradorEntity> {
        if (!moderador.usuario)
            throw new BusinessLogicException("A moderador must have a usuario", BusinessError.PRECONDITION_FAILED);

        const usuario: UsuarioEntity | null = await this.usuarioRepository.findOne({
            where: { id: moderador.usuario.id },
            relations: { moderador: true }
        });
        if (!usuario)
            throw new BusinessLogicException("The usuario with the given id was not found", BusinessError.NOT_FOUND);

        if (usuario.moderador)
            throw new BusinessLogicException("The usuario is already a moderador", BusinessError.PRECONDITION_FAILED);

        return await this.moderadorRepository.save(moderador);
    }

    async delete(id: string) {
        const moderador: ModeradorEntity | null = await this.moderadorRepository.findOne({ where: { id } });
        if (!moderador)
            throw new BusinessLogicException("The moderador with the given id was not found", BusinessError.NOT_FOUND);
        await this.moderadorRepository.remove(moderador);
    }
}