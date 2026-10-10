/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { DepositoHorasEntity } from './deposito-horas.entity';

@Injectable()
export class DepositoHorasService {
    constructor(
        @InjectRepository(DepositoHorasEntity)
        private readonly depositoHorasRepository: Repository<DepositoHorasEntity>
    ) {}

    async findAll(): Promise<DepositoHorasEntity[]> {
        return await this.depositoHorasRepository.find({
            relations: { donacionesComoDonante: true, donacionesComoReceptor: true }
        });
    }

    async findOne(id: string): Promise<DepositoHorasEntity> {
        const deposito: DepositoHorasEntity | null = await this.depositoHorasRepository.findOne({
            where: { id },
            relations: { donacionesComoDonante: true, donacionesComoReceptor: true }
        });
        if (!deposito)
            throw new BusinessLogicException("The deposito horas with the given id was not found", BusinessError.NOT_FOUND);
        return deposito;
    }

    async create(deposito: DepositoHorasEntity): Promise<DepositoHorasEntity> {
        if (deposito.saldo < 0)
            throw new BusinessLogicException("The saldo of a deposito horas cannot be negative", BusinessError.PRECONDITION_FAILED);
        return await this.depositoHorasRepository.save(deposito);
    }

    async update(id: string, deposito: DepositoHorasEntity): Promise<DepositoHorasEntity> {
        const persisted: DepositoHorasEntity | null = await this.depositoHorasRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The deposito horas with the given id was not found", BusinessError.NOT_FOUND);
        if (deposito.saldo < 0)
            throw new BusinessLogicException("The saldo of a deposito horas cannot be negative", BusinessError.PRECONDITION_FAILED);
        deposito.id = id;
        return await this.depositoHorasRepository.save(deposito);
    }

    async delete(id: string) {
        const deposito: DepositoHorasEntity | null = await this.depositoHorasRepository.findOne({ where: { id } });
        if (!deposito)
            throw new BusinessLogicException("The deposito horas with the given id was not found", BusinessError.NOT_FOUND);
        await this.depositoHorasRepository.remove(deposito);
    }
}