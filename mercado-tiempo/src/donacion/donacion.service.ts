/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { DonacionEntity } from './donacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { CausaEntity } from '../causa/causa.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

@Injectable()
export class DonacionService {
    constructor(
        @InjectRepository(DonacionEntity)
        private readonly donacionRepository: Repository<DonacionEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(DepositoHorasEntity)
        private readonly depositoHorasRepository: Repository<DepositoHorasEntity>,

        @InjectRepository(CausaEntity)
        private readonly causaRepository: Repository<CausaEntity>
    ) {}

    async findAll(): Promise<DonacionEntity[]> {
        return await this.donacionRepository.find({
            relations: { perfilDonante: true, depositoDonante: true, perfilReceptor: true, depositoReceptor: true, causa: true }
        });
    }

    async findOne(id: string): Promise<DonacionEntity> {
        const donacion: DonacionEntity | null = await this.donacionRepository.findOne({
            where: { id },
            relations: { perfilDonante: true, depositoDonante: true, perfilReceptor: true, depositoReceptor: true, causa: true }
        });
        if (!donacion)
            throw new BusinessLogicException("The donacion with the given id was not found", BusinessError.NOT_FOUND);
        return donacion;
    }

    // --- Donar horas (RF-050): descuenta al donante, acredita al receptor y deja ambos movimientos ---
    // Las donaciones no se borran ni se editan: ya movieron horas y forman parte del historial (RF-056).

    async create(donacion: DonacionEntity): Promise<DonacionEntity> {
        if (!donacion.horasDonadas || donacion.horasDonadas <= 0 || !Number.isInteger(donacion.horasDonadas))
            throw new BusinessLogicException("The horasDonadas must be a positive integer", BusinessError.PRECONDITION_FAILED);

        await this.validarDonante(donacion);
        await this.validarReceptor(donacion);
        await this.validarDistintos(donacion);
        if (donacion.causa) {
            const causa = await this.causaRepository.findOne({ where: { id: donacion.causa.id } });
            if (!causa)
                throw new BusinessLogicException("The causa with the given id was not found", BusinessError.NOT_FOUND);
        }

        // Todo en una sola transacción de BD: o se mueven las horas y se guarda la donación, o nada
        const id = await this.donacionRepository.manager.transaction(async manager => {
            const nueva = await manager.save(DonacionEntity, donacion);

            await this.moverHoras(manager, nueva, -donacion.horasDonadas, TipoTransaccion.DONACION_ENVIADA,
                donacion.perfilDonante, donacion.depositoDonante);
            await this.moverHoras(manager, nueva, donacion.horasDonadas, TipoTransaccion.DONACION_RECIBIDA,
                donacion.perfilReceptor, donacion.depositoReceptor);

            return nueva.id;
        });

        return await this.findOne(id);
    }

    // Suma o resta horas a un perfil o al fondo, y registra la transacción
    private async moverHoras(
        manager: EntityManager,
        donacion: DonacionEntity,
        horas: number,
        tipo: TipoTransaccion,
        perfil?: PerfilMiembroEntity,
        deposito?: DepositoHorasEntity
    ) {
        if (perfil) {
            const actual = await manager.findOne(PerfilMiembroEntity, { where: { id: perfil.id } });
            if (!actual)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
            if (actual.saldo + horas < 0)
                throw new BusinessLogicException("The perfil donante does not have enough saldo", BusinessError.PRECONDITION_FAILED);

            const saldoResultante = actual.saldo + horas;
            await manager.update(PerfilMiembroEntity, actual.id, { saldo: saldoResultante });
            await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                tipo, horas, saldoResultante, perfil: { id: actual.id }, donacion: { id: donacion.id },
            }));
        } else if (deposito) {
            const actual = await manager.findOne(DepositoHorasEntity, { where: { id: deposito.id } });
            if (!actual)
                throw new BusinessLogicException("The deposito horas with the given id was not found", BusinessError.NOT_FOUND);
            if (actual.saldo + horas < 0)
                throw new BusinessLogicException("The fondo comunitario does not have enough saldo", BusinessError.PRECONDITION_FAILED);

            const saldoResultante = actual.saldo + horas;
            await manager.update(DepositoHorasEntity, actual.id, { saldo: saldoResultante });
            await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                tipo, horas, saldoResultante, deposito: { id: actual.id }, donacion: { id: donacion.id },
            }));
        }
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