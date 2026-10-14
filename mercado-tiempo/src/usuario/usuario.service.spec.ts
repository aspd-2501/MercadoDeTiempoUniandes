/* eslint-disable prettier/prettier */
/* archivo: src/usuario/usuario.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { UsuarioService } from './usuario.service';
import { UsuarioEntity } from './usuario.entity';

describe('UsuarioService', () => {
    let service: UsuarioService;
    let usuarioRepository: Repository<UsuarioEntity>;
    let usuariosList: UsuarioEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [UsuarioService],
        }).compile();

        service = module.get<UsuarioService>(UsuarioService);
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));

        await seedDatabase();
    });

    const seedDatabase = async () => {
        await usuarioRepository.clear();

        usuariosList = [];
        for (let i = 0; i < 5; i++) {
            const usuario: UsuarioEntity = await usuarioRepository.save({
                idUniandes: faker.string.alphanumeric(10),
                nombre: faker.person.fullName(),
                contrasenia: await bcrypt.hash("password123", 10),
                edad: faker.number.int({ min: 18, max: 60 }),
                afiliacionUniandes: "Estudiante",
            });
            usuariosList.push(usuario);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all usuarios', async () => {
        const usuarios = await service.findAll();
        expect(usuarios.length).toBe(usuariosList.length);
    });

    it('findOne should return a usuario by id', async () => {
        const stored = usuariosList[0];
        const usuario = await service.findOne(stored.id);
        expect(usuario).not.toBeNull();
        expect(usuario.nombre).toBe(stored.nombre);
    });

    it('findOne should throw an exception for an invalid usuario', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });

    it('create should save a usuario with a hashed contrasenia', async () => {
        const usuario: UsuarioEntity = {
            id: "",
            idUniandes: faker.string.alphanumeric(10),
            nombre: faker.person.fullName(),
            contrasenia: "password123",
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        } as UsuarioEntity;

        const result = await service.create(usuario);
        expect(result).not.toBeNull();
        expect(result.contrasenia).not.toBe("password123");

        const esValida = await bcrypt.compare("password123", result.contrasenia);
        expect(esValida).toBe(true);
    });

    it('create should throw an exception without idUniandes', async () => {
        const usuario: UsuarioEntity = {
            id: "",
            nombre: faker.person.fullName(),
            contrasenia: "password123",
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        } as UsuarioEntity;

        await expect(() => service.create(usuario))
            .rejects.toHaveProperty("message", "A usuario must have an idUniandes");
    });

    it('create should throw an exception for a duplicate idUniandes', async () => {
        const usuario: UsuarioEntity = {
            id: "",
            idUniandes: usuariosList[0].idUniandes,
            nombre: faker.person.fullName(),
            contrasenia: "password123",
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        } as UsuarioEntity;

        await expect(() => service.create(usuario))
            .rejects.toHaveProperty("message", "A usuario with that idUniandes already exists");
    });

    it('create should throw an exception for a short contrasenia', async () => {
        const usuario: UsuarioEntity = {
            id: "",
            idUniandes: faker.string.alphanumeric(10),
            nombre: faker.person.fullName(),
            contrasenia: "123",
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        } as UsuarioEntity;

        await expect(() => service.create(usuario))
            .rejects.toHaveProperty("message", "The contrasenia must have at least 6 characters");
    });

    it('update should modify a usuario without rehashing an unchanged contrasenia', async () => {
        const usuario = usuariosList[0];
        const contraseniaOriginal = usuario.contrasenia;
        usuario.nombre = faker.person.fullName();

        const updated = await service.update(usuario.id, usuario);
        expect(updated.nombre).toBe(usuario.nombre);
        expect(updated.contrasenia).toBe(contraseniaOriginal);
    });

    it('update should rehash a new contrasenia', async () => {
        const usuario = usuariosList[0];
        usuario.contrasenia = "nuevaPassword456";

        const updated = await service.update(usuario.id, usuario);
        const esValida = await bcrypt.compare("nuevaPassword456", updated.contrasenia);
        expect(esValida).toBe(true);
    });

    it('update should throw an exception for a short new contrasenia', async () => {
        const usuario = usuariosList[0];
        usuario.contrasenia = "123";

        await expect(() => service.update(usuario.id, usuario))
            .rejects.toHaveProperty("message", "The contrasenia must have at least 6 characters");
    });

    it('update should throw an exception for an invalid usuario', async () => {
        const usuario = { ...usuariosList[0], nombre: faker.person.fullName() };
        await expect(() => service.update("0", usuario))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });

    it('validarCredenciales should return the usuario for valid credentials', async () => {
        const usuario = usuariosList[0];
        const result = await service.validarCredenciales(usuario.idUniandes, "password123");
        expect(result.id).toBe(usuario.id);
    });

    it('validarCredenciales should throw an exception for an invalid idUniandes', async () => {
        await expect(() => service.validarCredenciales("no-existe", "password123"))
            .rejects.toHaveProperty("message", "Invalid credentials");
    });

    it('validarCredenciales should throw an exception for an invalid contrasenia', async () => {
        const usuario = usuariosList[0];
        await expect(() => service.validarCredenciales(usuario.idUniandes, "wrongPassword"))
            .rejects.toHaveProperty("message", "Invalid credentials");
    });

    it('delete should remove a usuario', async () => {
        const usuario = usuariosList[0];
        await service.delete(usuario.id);
        const deleted = await usuarioRepository.findOne({ where: { id: usuario.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid usuario', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });
});