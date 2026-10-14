/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ServicioPotencialService } from './servicio-potencial.service';
import { ServicioPotencialEntity } from './servicio-potencial.entity';
import { ServicioPotencialCategoriaEntity } from './servicio-potencial-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

describe('ServicioPotencialService', () => {
    let service: ServicioPotencialService;
    let servicioPotencialRepository: Repository<ServicioPotencialEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let categoriaRepository: Repository<CategoriaEntity>;
    let servicioCategoriaRepository: Repository<ServicioPotencialCategoriaEntity>;

    let perfil: PerfilMiembroEntity;
    let categoriasList: CategoriaEntity[];
    let servicio: ServicioPotencialEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ServicioPotencialService],
        }).compile();

        service = module.get<ServicioPotencialService>(ServicioPotencialService);
        servicioPotencialRepository = module.get<Repository<ServicioPotencialEntity>>(getRepositoryToken(ServicioPotencialEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        categoriaRepository = module.get<Repository<CategoriaEntity>>(getRepositoryToken(CategoriaEntity));
        servicioCategoriaRepository = module.get<Repository<ServicioPotencialCategoriaEntity>>(getRepositoryToken(ServicioPotencialCategoriaEntity));

        await seedDatabase();
    });

    const createPerfil = async (): Promise<PerfilMiembroEntity> => {
        const usuario: UsuarioEntity = await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            nombre: faker.person.fullName(),
            contrasenia: faker.internet.password(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        });

        return await perfilRepository.save({
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            intereses: faker.lorem.words(3),
            estadoActividad: true,
            saldo: faker.number.int({ min: 0, max: 100 }),
            usuario,
        });
    };

    const seedDatabase = async () => {
        await servicioCategoriaRepository.clear();
        await servicioPotencialRepository.clear();
        await categoriaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();

        categoriasList = [];
        for (let i = 0; i < 5; i++) {
            categoriasList.push(await categoriaRepository.save({ nombre: faker.commerce.department() }));
        }

        servicio = await servicioPotencialRepository.save({ perfil });

        await servicioCategoriaRepository.save({ idServicioPotencial: servicio.id, idCategoria: categoriasList[0].id });
        await servicioCategoriaRepository.save({ idServicioPotencial: servicio.id, idCategoria: categoriasList[1].id });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a servicio potencial with 1 to 3 categorias', async () => {
        const nuevoServicio: ServicioPotencialEntity = { id: "", perfil } as ServicioPotencialEntity;

        const result = await service.create(nuevoServicio, [categoriasList[2].id]);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(1);
    });

    it('create should throw an exception without a perfil', async () => {
        const nuevoServicio: ServicioPotencialEntity = { id: "" } as ServicioPotencialEntity;

        await expect(() => service.create(nuevoServicio, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "A servicio potencial must have a perfil");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const invalidPerfil: PerfilMiembroEntity = { id: "0" } as PerfilMiembroEntity;
        const nuevoServicio: ServicioPotencialEntity = { id: "", perfil: invalidPerfil } as ServicioPotencialEntity;

        await expect(() => service.create(nuevoServicio, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('create should throw an exception with no categorias', async () => {
        const nuevoServicio: ServicioPotencialEntity = { id: "", perfil } as ServicioPotencialEntity;

        await expect(() => service.create(nuevoServicio, []))
            .rejects.toHaveProperty("message", "A servicio potencial must have between 1 and 3 categorias");
    });

    it('create should throw an exception with more than 3 categorias', async () => {
        const nuevoServicio: ServicioPotencialEntity = { id: "", perfil } as ServicioPotencialEntity;

        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.create(nuevoServicio, ids))
            .rejects.toHaveProperty("message", "A servicio potencial must have between 1 and 3 categorias");
    });

    it('create should throw an exception for an invalid categoria', async () => {
        const nuevoServicio: ServicioPotencialEntity = { id: "", perfil } as ServicioPotencialEntity;

        await expect(() => service.create(nuevoServicio, ["0"]))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });

    it('findOne should return a servicio potencial by id', async () => {
        const result = await service.findOne(servicio.id);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(2);
    });

    it('findOne should throw an exception for an invalid servicio potencial', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The servicio potencial with the given id was not found");
    });

    it('findCategoriasByServicioId should return the categorias of a servicio', async () => {
        const categorias = await service.findCategoriasByServicioId(servicio.id);
        expect(categorias.length).toBe(2);
    });

    it('findCategoriasByServicioId should throw an exception for an invalid servicio potencial', async () => {
        await expect(() => service.findCategoriasByServicioId("0"))
            .rejects.toHaveProperty("message", "The servicio potencial with the given id was not found");
    });

    it('associateCategoriasServicio should update the categorias of a servicio', async () => {
        const result = await service.associateCategoriasServicio(servicio.id, [categoriasList[3].id]);
        expect(result.categorias.length).toBe(1);
    });

    it('associateCategoriasServicio should throw an exception for an invalid servicio potencial', async () => {
        await expect(() => service.associateCategoriasServicio("0", [categoriasList[3].id]))
            .rejects.toHaveProperty("message", "The servicio potencial with the given id was not found");
    });

    it('associateCategoriasServicio should throw an exception with more than 3 categorias', async () => {
        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.associateCategoriasServicio(servicio.id, ids))
            .rejects.toHaveProperty("message", "A servicio potencial must have between 1 and 3 categorias");
    });

    it('delete should remove a servicio potencial', async () => {
        await service.delete(servicio.id);
        const deleted = await servicioPotencialRepository.findOne({ where: { id: servicio.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid servicio potencial', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The servicio potencial with the given id was not found");
    });
});