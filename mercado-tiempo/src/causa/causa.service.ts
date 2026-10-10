/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { CausaEntity } from './causa.entity';

@Injectable()
export class CausaService {
    constructor(
        @InjectRepository(CausaEntity)
        private readonly causaRepository: Repository<CausaEntity>
    ) {}

    async findAll(): Promise<CausaEntity[]> {
        return await this.causaRepository.find({
            relations: { perfilCreador: true, perfilReceptor: true }
        });
    }

    async findOne(id: string): Promise<CausaEntity> {
        const causa: CausaEntity | null = await this.causaRepository.findOne({
            where: { id },
            relations: { perfilCreador: true, perfilReceptor: true }
        });
        if (!causa)
            throw new BusinessLogicException("The causa with the given id was not found", BusinessError.NOT_FOUND);
        return causa;
    }

    async create(causa: CausaEntity): Promise<CausaEntity> {
        return await this.causaRepository.save(causa);
    }

    async update(id: string, causa: CausaEntity): Promise<CausaEntity> {
        const persisted: CausaEntity | null = await this.causaRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The causa with the given id was not found", BusinessError.NOT_FOUND);
        causa.id = id;
        return await this.causaRepository.save(causa);
    }

    async delete(id: string) {
        const causa: CausaEntity | null = await this.causaRepository.findOne({ where: { id } });
        if (!causa)
            throw new BusinessLogicException("The causa with the given id was not found", BusinessError.NOT_FOUND);
        await this.causaRepository.remove(causa);
    }
}