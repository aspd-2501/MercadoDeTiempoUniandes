/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { DonacionEntity } from './donacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';

@Injectable()
export class DonacionService {
    constructor(
        @InjectRepository(DonacionEntity)
        private readonly donacionRepository: Repository<DonacionEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(DepositoHorasEntity)
        private readonly depositoHorasRepository: Repository<DepositoHorasEntity>
    ) {}

    async findAll(): Promise<DonacionEntity[]> {
        return await this.donacionRepository.find({
            relations: { perfilDonante: true, depositoDonante: true, perfilReceptor: true, depositoReceptor: true }
        });
    }

    async findOne(id: string): Promise<DonacionEntity> {
        const donacion: DonacionEntity | null = await this.donacionRepository.findOne({
            where: { id },
            relations: { perfilDonante: true, depositoDonante: true, perfilReceptor: true, depositoReceptor: true }
        });
        if (!donacion)
            throw new BusinessLogicException("The donacion with the given id was not found", BusinessError.NOT_FOUND);
        return donacion;
    }

    async create(donacion: DonacionEntity): Promise<DonacionEntity> {
        await this.validarDonante(donacion);
        await this.validarReceptor(donacion);
        await this.validarDistintos(donacion);
        return await this.donacionRepository.save(donacion);
    }

    async delete(id: string) {
        const donacion: DonacionEntity | null = await this.donacionRepository.findOne({ where: { id } });
        if (!donacion)
            throw new BusinessLogicException("The donacion with the given id was not found", BusinessError.NOT_FOUND);
        await this.donacionRepository.remove(donacion);
    }

    // --- Validaciones de negocio (espejo de los CHECK a nivel de BD) ---

    private async validarDonante(donacion: DonacionEntity) {
        const tienePerfil = !!donacion.perfilDonante;
        const tieneDeposito = !!donacion.depositoDonante;

        if (tienePerfil === tieneDeposito)
            throw new BusinessLogicException("A donacion must have exactly one donante: a perfil or a deposito", BusinessError.PRECONDITION_FAILED);

        if (tienePerfil) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: donacion.perfilDonante.id } });
            if (!perfil)
                throw new BusinessLogicException("The perfil donante with the given id was not found", BusinessError.NOT_FOUND);
        } else {
            const deposito = await this.depositoHorasRepository.findOne({ where: { id: donacion.depositoDonante.id } });
            if (!deposito)
                throw new BusinessLogicException("The deposito donante with the given id was not found", BusinessError.NOT_FOUND);
        }
    }

    private async validarReceptor(donacion: DonacionEntity) {
        const tienePerfil = !!donacion.perfilReceptor;
        const tieneDeposito = !!donacion.depositoReceptor;

        if (tienePerfil === tieneDeposito)
            throw new BusinessLogicException("A donacion must have exactly one receptor: a perfil or a deposito", BusinessError.PRECONDITION_FAILED);

        if (tienePerfil) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: donacion.perfilReceptor.id } });
            if (!perfil)
                throw new BusinessLogicException("The perfil receptor with the given id was not found", BusinessError.NOT_FOUND);
        } else {
            const deposito = await this.depositoHorasRepository.findOne({ where: { id: donacion.depositoReceptor.id } });
            if (!deposito)
                throw new BusinessLogicException("The deposito receptor with the given id was not found", BusinessError.NOT_FOUND);
        }
    }

    private async validarDistintos(donacion: DonacionEntity) {
        if (donacion.perfilDonante && donacion.perfilReceptor && donacion.perfilDonante.id === donacion.perfilReceptor.id)
            throw new BusinessLogicException("The donante and receptor perfiles cannot be the same", BusinessError.PRECONDITION_FAILED);

        if (donacion.depositoDonante && donacion.depositoReceptor && donacion.depositoDonante.id === donacion.depositoReceptor.id)
            throw new BusinessLogicException("The donante and receptor depositos cannot be the same", BusinessError.PRECONDITION_FAILED);
    }
}