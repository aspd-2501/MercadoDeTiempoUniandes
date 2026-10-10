/* eslint-disable prettier/prettier */
/* archivo: src/categoria/categoria.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CategoriaService } from './categoria.service';
import { CategoriaEntity } from './categoria.entity';

describe('CategoriaService', () => {
    let service: CategoriaService;
    let categoriaRepository: Repository<CategoriaEntity>;
    let categoriasList: CategoriaEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [CategoriaService],
        }).compile();

        service = module.get<CategoriaService>(CategoriaService);
        categoriaRepository = module.get<Repository<CategoriaEntity>>(getRepositoryToken(CategoriaEntity));

        await seedDatabase();
    });

    const seedDatabase = async () => {
        await categoriaRepository.clear();

        categoriasList = [];
        for (let i = 0; i < 5; i++) {
            const categoria: CategoriaEntity = await categoriaRepository.save({
                nombre: faker.commerce.department(),
            });
            categoriasList.push(categoria);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all categorias', async () => {
        const categorias: CategoriaEntity[] = await service.findAll();
        expect(categorias.length).toBe(categoriasList.length);
    });

    it('findOne should return a categoria by id', async () => {
        const storedCategoria: CategoriaEntity = categoriasList[0];
        const categoria: CategoriaEntity = await service.findOne(storedCategoria.id);
        expect(categoria).not.toBeNull();
        expect(categoria.nombre).toBe(storedCategoria.nombre);
    });

    it('findOne should throw an exception for an invalid categoria', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });

    it('create should return a new categoria', async () => {
        const categoria: CategoriaEntity = { id: "", nombre: faker.commerce.department() } as CategoriaEntity;
        const newCategoria: CategoriaEntity = await service.create(categoria);
        expect(newCategoria).not.toBeNull();

        const storedCategoria: CategoriaEntity | null = await categoriaRepository.findOne({ where: { id: newCategoria.id } });
        expect(storedCategoria).not.toBeNull();
        expect(storedCategoria!.nombre).toBe(categoria.nombre);
    });

    it('update should modify a categoria', async () => {
        const categoria: CategoriaEntity = categoriasList[0];
        categoria.nombre = faker.commerce.department();
        const updatedCategoria: CategoriaEntity = await service.update(categoria.id, categoria);
        expect(updatedCategoria).not.toBeNull();
        expect(updatedCategoria.nombre).toBe(categoria.nombre);
    });

    it('update should throw an exception for an invalid categoria', async () => {
        let categoria: CategoriaEntity = categoriasList[0];
        categoria = { ...categoria, nombre: faker.commerce.department() };
        await expect(() => service.update("0", categoria))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });

    it('delete should remove a categoria', async () => {
        const categoria: CategoriaEntity = categoriasList[0];
        await service.delete(categoria.id);

        const deletedCategoria: CategoriaEntity | null = await categoriaRepository.findOne({ where: { id: categoria.id } });
        expect(deletedCategoria).toBeNull();
    });

    it('delete should throw an exception for an invalid categoria', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });
});