/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

describe('ServicioOfrecidoService', () => {
    let service: ServicioOfrecidoService;
    let servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let categoriaRepository: Repository<CategoriaEntity>;
    let servicioCategoriaRepository: Repository<ServicioOfrecidoCategoriaEntity>;

    let perfil: PerfilMiembroEntity;
    let categoriasList: CategoriaEntity[];
    let servicio: ServicioOfrecidoEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ServicioOfrecidoService],
        }).compile();

        service = module.get<ServicioOfrecidoService>(ServicioOfrecidoService);
        servicioOfrecidoRepository = module.get<Repository<ServicioOfrecidoEntity>>(getRepositoryToken(ServicioOfrecidoEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        categoriaRepository = module.get<Repository<CategoriaEntity>>(getRepositoryToken(CategoriaEntity));
        servicioCategoriaRepository = module.get<Repository<ServicioOfrecidoCategoriaEntity>>(getRepositoryToken(ServicioOfrecidoCategoriaEntity));

        await seedDatabase();
    });

    const createPerfil = async (): Promise<PerfilMiembroEntity> => {
        const usuario: UsuarioEntity = await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            contrasenia: faker.internet.password(),
        });

        return await perfilRepository.save({
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre: faker.person.fullName(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: faker.number.int({ min: 0, max: 100 }),
            usuario,
        });
    };

    const seedDatabase = async () => {
        await servicioCategoriaRepository.clear();
        await servicioOfrecidoRepository.clear();
        await categoriaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();

        categoriasList = [];
        for (let i = 0; i < 5; i++) {
            categoriasList.push(await categoriaRepository.save({ nombre: faker.commerce.department() }));
        }

        servicio = await servicioOfrecidoRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil,
        });

        await servicioCategoriaRepository.save({ idServicio: servicio.id, idCategoria: categoriasList[0].id });
        await servicioCategoriaRepository.save({ idServicio: servicio.id, idCategoria: categoriasList[1].id });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a servicio ofrecido with 1 to 3 categorias', async () => {
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil,
        } as ServicioOfrecidoEntity;

        const result = await service.create(nuevoServicio, [categoriasList[2].id]);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(1);
    });

    it('create should throw an exception without a perfil', async () => {
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
        } as ServicioOfrecidoEntity;

        await expect(() => service.create(nuevoServicio, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "A servicio ofrecido must have a perfil");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const invalidPerfil: PerfilMiembroEntity = { id: "0" } as PerfilMiembroEntity;
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil: invalidPerfil,
        } as ServicioOfrecidoEntity;

        await expect(() => service.create(nuevoServicio, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('create should throw an exception with no categorias', async () => {
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil,
        } as ServicioOfrecidoEntity;

        await expect(() => service.create(nuevoServicio, []))
            .rejects.toHaveProperty("message", "A servicio ofrecido must have between 1 and 3 categorias");
    });

    it('create should throw an exception with more than 3 categorias', async () => {
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil,
        } as ServicioOfrecidoEntity;

        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.create(nuevoServicio, ids))
            .rejects.toHaveProperty("message", "A servicio ofrecido must have between 1 and 3 categorias");
    });

    it('create should throw an exception for an invalid categoria', async () => {
        const nuevoServicio: ServicioOfrecidoEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            perfil,
        } as ServicioOfrecidoEntity;

        await expect(() => service.create(nuevoServicio, ["0"]))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });

    it('findOne should return a servicio ofrecido by id', async () => {
        const result = await service.findOne(servicio.id);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(2);
    });

    it('findOne should throw an exception for an invalid servicio ofrecido', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });

    it('update should modify a servicio ofrecido', async () => {
        servicio.titulo = faker.lorem.words(3);
        const updated = await service.update(servicio.id, servicio);
        expect(updated.titulo).toBe(servicio.titulo);
    });

    it('update should throw an exception for an invalid servicio ofrecido', async () => {
        const invalido = { ...servicio, titulo: faker.lorem.words(3) };
        await expect(() => service.update("0", invalido))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });

    it('findCategoriasByServicioId should return the categorias of a servicio', async () => {
        const categorias = await service.findCategoriasByServicioId(servicio.id);
        expect(categorias.length).toBe(2);
    });

    it('findCategoriasByServicioId should throw an exception for an invalid servicio ofrecido', async () => {
        await expect(() => service.findCategoriasByServicioId("0"))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });

    it('associateCategoriasServicio should update the categorias of a servicio', async () => {
        const result = await service.associateCategoriasServicio(servicio.id, [categoriasList[3].id]);
        expect(result.categorias.length).toBe(1);
    });

    it('associateCategoriasServicio should throw an exception for an invalid servicio ofrecido', async () => {
        await expect(() => service.associateCategoriasServicio("0", [categoriasList[3].id]))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });

    it('associateCategoriasServicio should throw an exception with more than 3 categorias', async () => {
        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.associateCategoriasServicio(servicio.id, ids))
            .rejects.toHaveProperty("message", "A servicio ofrecido must have between 1 and 3 categorias");
    });

    it('delete should remove a servicio ofrecido', async () => {
        await service.delete(servicio.id);
        const deleted = await servicioOfrecidoRepository.findOne({ where: { id: servicio.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid servicio ofrecido', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });
});