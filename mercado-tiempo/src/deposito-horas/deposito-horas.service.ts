/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { DepositoHorasEntity } from './deposito-horas.entity';

// --- El DepositoHoras es el fondo comunitario: existe uno solo ---
// Su saldo solo cambia con movimientos (aportes de acuerdos grupales y donaciones),
// por eso no hay un endpoint para editarlo directamente.

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

    // Devuelve el fondo comunitario
    async findFondo(): Promise<DepositoHorasEntity> {
        const [fondo] = await this.depositoHorasRepository.find({ take: 1 });
        if (!fondo)
            throw new BusinessLogicException("The fondo comunitario has not been created", BusinessError.NOT_FOUND);
        return fondo;
    }

    async create(deposito: DepositoHorasEntity): Promise<DepositoHorasEntity> {
        if (deposito.saldo < 0)
            throw new BusinessLogicException("The saldo of a deposito horas cannot be negative", BusinessError.PRECONDITION_FAILED);

        const existentes = await this.depositoHorasRepository.count();
        if (existentes > 0)
            throw new BusinessLogicException("The fondo comunitario already exists; there can only be one deposito horas", BusinessError.PRECONDITION_FAILED);

        return await this.depositoHorasRepository.save(deposito);
    }

    async delete(id: string) {
        const deposito: DepositoHorasEntity | null = await this.depositoHorasRepository.findOne({ where: { id } });
        if (!deposito)
            throw new BusinessLogicException("The deposito horas with the given id was not found", BusinessError.NOT_FOUND);
        if (deposito.saldo !== 0)
            throw new BusinessLogicException("The fondo comunitario cannot be deleted while it has saldo", BusinessError.PRECONDITION_FAILED);
        await this.depositoHorasRepository.remove(deposito);
    }
}
