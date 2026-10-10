/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { DepositoHorasService } from './deposito-horas.service';
import { DepositoHorasEntity } from './deposito-horas.entity';

describe('DepositoHorasService', () => {
    let service: DepositoHorasService;
    let depositoHorasRepository: Repository<DepositoHorasEntity>;
    let depositosList: DepositoHorasEntity[];

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

        depositosList = [];
        for (let i = 0; i < 5; i++) {
            const deposito: DepositoHorasEntity = await depositoHorasRepository.save({
                saldo: faker.number.int({ min: 0, max: 100 }),
            });
            depositosList.push(deposito);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all depositos', async () => {
        const depositos: DepositoHorasEntity[] = await service.findAll();
        expect(depositos.length).toBe(depositosList.length);
    });

    it('findOne should return a deposito by id', async () => {
        const stored: DepositoHorasEntity = depositosList[0];
        const deposito: DepositoHorasEntity = await service.findOne(stored.id);
        expect(deposito).not.toBeNull();
        expect(deposito.saldo).toBe(stored.saldo);
    });

    it('findOne should throw an exception for an invalid deposito', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The deposito horas with the given id was not found");
    });

    it('create should return a new deposito', async () => {
        const deposito: DepositoHorasEntity = { id: "", saldo: faker.number.int({ min: 0, max: 100 }) } as DepositoHorasEntity;
        const newDeposito: DepositoHorasEntity = await service.create(deposito);
        expect(newDeposito).not.toBeNull();

        const stored: DepositoHorasEntity | null = await depositoHorasRepository.findOne({ where: { id: newDeposito.id } });
        expect(stored).not.toBeNull();
        expect(stored!.saldo).toBe(deposito.saldo);
    });

    it('create should throw an exception for a negative saldo', async () => {
        const deposito: DepositoHorasEntity = { id: "", saldo: -10 } as DepositoHorasEntity;
        await expect(() => service.create(deposito))
            .rejects.toHaveProperty("message", "The saldo of a deposito horas cannot be negative");
    });

    it('update should modify a deposito', async () => {
        const deposito: DepositoHorasEntity = depositosList[0];
        deposito.saldo = faker.number.int({ min: 0, max: 100 });
        const updated: DepositoHorasEntity = await service.update(deposito.id, deposito);
        expect(updated).not.toBeNull();
        expect(updated.saldo).toBe(deposito.saldo);
    });

    it('update should throw an exception for an invalid deposito', async () => {
        let deposito: DepositoHorasEntity = depositosList[0];
        deposito = { ...deposito, saldo: faker.number.int({ min: 0, max: 100 }) };
        await expect(() => service.update("0", deposito))
            .rejects.toHaveProperty("message", "The deposito horas with the given id was not found");
    });

    it('update should throw an exception for a negative saldo', async () => {
        const deposito: DepositoHorasEntity = depositosList[0];
        deposito.saldo = -5;
        await expect(() => service.update(deposito.id, deposito))
            .rejects.toHaveProperty("message", "The saldo of a deposito horas cannot be negative");
    });

    it('delete should remove a deposito', async () => {
        const deposito: DepositoHorasEntity = depositosList[0];
        await service.delete(deposito.id);

        const deleted: DepositoHorasEntity | null = await depositoHorasRepository.findOne({ where: { id: deposito.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid deposito', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The deposito horas with the given id was not found");
    });
});