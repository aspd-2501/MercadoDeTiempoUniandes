/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { DepositoHorasService } from './deposito-horas.service';
import { DepositoHorasEntity } from './deposito-horas.entity';

describe('DepositoHorasService', () => {
    let service: DepositoHorasService;
    let depositoHorasRepository: Repository<DepositoHorasEntity>;

    let fondo: DepositoHorasEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [DepositoHorasService],
        }).compile();

        service = module.get<DepositoHorasService>(DepositoHorasService);
        depositoHorasRepository = module.get<Repository<DepositoHorasEntity>>(getRepositoryToken(DepositoHorasEntity));

        await seedDatabase();
    });

    const seedDatabase = async () => {
        await depositoHorasRepository.clear();
        fondo = await depositoHorasRepository.save({ saldo: 15 });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return the fondo comunitario', async () => {
        const depositos = await service.findAll();
        expect(depositos.length).toBe(1);
    });

    it('findOne should return a deposito by id', async () => {
        const deposito = await service.findOne(fondo.id);
        expect(deposito.saldo).toBe(15);
    });

    it('findOne should throw an exception for an invalid deposito', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The deposito horas with the given id was not found");
    });

    it('findFondo should return the fondo comunitario', async () => {
        const result = await service.findFondo();
        expect(result.id).toBe(fondo.id);
    });

    it('findFondo should throw an exception when the fondo does not exist', async () => {
        await depositoHorasRepository.clear();
        await expect(() => service.findFondo())
            .rejects.toHaveProperty("message", "The fondo comunitario has not been created");
    });

    it('create should create the fondo when none exists', async () => {
        await depositoHorasRepository.clear();
        const nuevo = await service.create({ saldo: 0 } as DepositoHorasEntity);
        expect(nuevo.id).toBeTruthy();
        expect(await depositoHorasRepository.count()).toBe(1);
    });

    it('create should throw an exception when the fondo already exists', async () => {
        await expect(() => service.create({ id: "", saldo: 0 } as DepositoHorasEntity))
            .rejects.toHaveProperty("message", "The fondo comunitario already exists; there can only be one deposito horas");
    });

    it('create should throw an exception for a negative saldo', async () => {
        await depositoHorasRepository.clear();
        await expect(() => service.create({ id: "", saldo: -10 } as DepositoHorasEntity))
            .rejects.toHaveProperty("message", "The saldo of a deposito horas cannot be negative");
    });

    it('delete should remove the fondo when its saldo is 0', async () => {
        await depositoHorasRepository.update(fondo.id, { saldo: 0 });
        await service.delete(fondo.id);
        expect(await depositoHorasRepository.count()).toBe(0);
    });

    it('delete should throw an exception while the fondo has saldo', async () => {
        await expect(() => service.delete(fondo.id))
            .rejects.toHaveProperty("message", "The fondo comunitario cannot be deleted while it has saldo");
    });

    it('delete should throw an exception for an invalid deposito', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The deposito horas with the given id was not found");
    });
});
