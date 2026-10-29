/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { TransaccionEntity } from './transaccion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class TransaccionService {
    constructor(
        @InjectRepository(TransaccionEntity)
        private readonly transaccionRepository: Repository<TransaccionEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>
    ) {}

    // --- Historial de movimientos de un miembro, del más reciente al más antiguo (RF-056) ---

    async findByPerfilId(perfilId: string): Promise<TransaccionEntity[]> {
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        return await this.transaccionRepository.find({
            where: { perfil: { id: perfilId } },
            relations: { acuerdo: true },
            order: { fecha: 'DESC' }
        });
    }
}
