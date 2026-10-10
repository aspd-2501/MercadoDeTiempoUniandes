/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { OrganizacionInstitucionalService } from './organizacion-institucional.service';
import { OrganizacionInstitucionalEntity } from './organizacion-institucional.entity';

describe('OrganizacionInstitucionalService', () => {
    let service: OrganizacionInstitucionalService;
    let organizacionRepository: Repository<OrganizacionInstitucionalEntity>;
    let organizacionesList: OrganizacionInstitucionalEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [OrganizacionInstitucionalService],
        }).compile();

        service = module.get<OrganizacionInstitucionalService>(OrganizacionInstitucionalService);
        organizacionRepository = module.get<Repository<OrganizacionInstitucionalEntity>>(getRepositoryToken(OrganizacionInstitucionalEntity));

        await seedDatabase();
    });

    const seedDatabase = async () => {
        await organizacionRepository.clear();

        organizacionesList = [];
        for (let i = 0; i < 5; i++) {
            const organizacion: OrganizacionInstitucionalEntity = await organizacionRepository.save({
                nombre: faker.company.name(),
                descripcion: faker.lorem.sentence(),
                imagen: faker.image.url(),
            });
            organizacionesList.push(organizacion);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all organizaciones', async () => {
        const organizaciones: OrganizacionInstitucionalEntity[] = await service.findAll();
        expect(organizaciones.length).toBe(organizacionesList.length);
    });

    it('findOne should return an organizacion by id', async () => {
        const stored: OrganizacionInstitucionalEntity = organizacionesList[0];
        const organizacion: OrganizacionInstitucionalEntity = await service.findOne(stored.id);
        expect(organizacion).not.toBeNull();
        expect(organizacion.nombre).toBe(stored.nombre);
        expect(organizacion.descripcion).toBe(stored.descripcion);
    });

    it('findOne should throw an exception for an invalid organizacion', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The organizacion institucional with the given id was not found");
    });

    it('create should return a new organizacion', async () => {
        const organizacion: OrganizacionInstitucionalEntity = {
            id: "",
            nombre: faker.company.name(),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
        } as OrganizacionInstitucionalEntity;

        const newOrganizacion: OrganizacionInstitucionalEntity = await service.create(organizacion);
        expect(newOrganizacion).not.toBeNull();

        const stored: OrganizacionInstitucionalEntity | null = await organizacionRepository.findOne({ where: { id: newOrganizacion.id } });
        expect(stored).not.toBeNull();
        expect(stored!.nombre).toBe(organizacion.nombre);
    });

    it('update should modify an organizacion', async () => {
        const organizacion: OrganizacionInstitucionalEntity = organizacionesList[0];
        organizacion.nombre = faker.company.name();
        const updated: OrganizacionInstitucionalEntity = await service.update(organizacion.id, organizacion);
        expect(updated).not.toBeNull();
        expect(updated.nombre).toBe(organizacion.nombre);
    });

    it('update should throw an exception for an invalid organizacion', async () => {
        let organizacion: OrganizacionInstitucionalEntity = organizacionesList[0];
        organizacion = { ...organizacion, nombre: faker.company.name() };
        await expect(() => service.update("0", organizacion))
            .rejects.toHaveProperty("message", "The organizacion institucional with the given id was not found");
    });

    it('delete should remove an organizacion', async () => {
        const organizacion: OrganizacionInstitucionalEntity = organizacionesList[0];
        await service.delete(organizacion.id);

        const deleted: OrganizacionInstitucionalEntity | null = await organizacionRepository.findOne({ where: { id: organizacion.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid organizacion', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The organizacion institucional with the given id was not found");
    });
});