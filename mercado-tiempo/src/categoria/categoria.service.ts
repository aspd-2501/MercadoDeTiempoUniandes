/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { CategoriaEntity } from './categoria.entity';

@Injectable()
export class CategoriaService {
    constructor(
        @InjectRepository(CategoriaEntity)
        private readonly categoriaRepository: Repository<CategoriaEntity>
    ) {}

    async findAll(): Promise<CategoriaEntity[]> {
        return await this.categoriaRepository.find({
            relations: { postsDeAyuda: true, serviciosOfrecidos: true, serviciosPotenciales: true }
        });
    }

    async findOne(id: string): Promise<CategoriaEntity> {
        const categoria: CategoriaEntity | null = await this.categoriaRepository.findOne({
            where: { id },
            relations: { postsDeAyuda: true, serviciosOfrecidos: true, serviciosPotenciales: true }
        });
        if (!categoria)
            throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        return categoria;
    }

    async create(categoria: CategoriaEntity): Promise<CategoriaEntity> {
        return await this.categoriaRepository.save(categoria);
    }

    async update(id: string, categoria: CategoriaEntity): Promise<CategoriaEntity> {
        const persisted: CategoriaEntity | null = await this.categoriaRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        categoria.id = id;
        return await this.categoriaRepository.save(categoria);
    }

    async delete(id: string) {
        const categoria: CategoriaEntity | null = await this.categoriaRepository.findOne({ where: { id } });
        if (!categoria)
            throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        await this.categoriaRepository.remove(categoria);
    }
}