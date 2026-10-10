/* eslint-disable prettier/prettier */
/* archivo: src/moderador/moderador.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ModeradorService } from './moderador.service';
import { ModeradorEntity } from './moderador.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('ModeradorService', () => {
    let service: ModeradorService;
    let moderadorRepository: Repository<ModeradorEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let usuario: UsuarioEntity;
    let moderador: ModeradorEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ModeradorService],
        }).compile();

        service = module.get<ModeradorService>(ModeradorService);
        moderadorRepository = module.get<Repository<ModeradorEntity>>(getRepositoryToken(ModeradorEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));

        await seedDatabase();
    });

    const createUsuario = async (): Promise<UsuarioEntity> => {
        return await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            nombre: faker.person.fullName(),
            contrasenia: faker.internet.password(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
        });
    };

    const seedDatabase = async () => {
        await moderadorRepository.clear();
        await usuarioRepository.clear();

        usuario = await createUsuario();
        moderador = await moderadorRepository.save({ usuario });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a moderador for a usuario', async () => {
        const nuevoUsuario = await createUsuario();
        const nuevoModerador: ModeradorEntity = { id: "", usuario: nuevoUsuario } as ModeradorEntity;

        const result = await service.create(nuevoModerador);
        expect(result).not.toBeNull();

        const stored = await moderadorRepository.findOne({
            where: { id: result.id },
            relations: { usuario: true }
        });
        expect(stored!.usuario.id).toBe(nuevoUsuario.id);
    });

    it('create should throw an exception without a usuario', async () => {
        const nuevoModerador: ModeradorEntity = { id: "" } as ModeradorEntity;
        await expect(() => service.create(nuevoModerador))
            .rejects.toHaveProperty("message", "A moderador must have a usuario");
    });

    it('create should throw an exception for an invalid usuario', async () => {
        const invalidUsuario: UsuarioEntity = { id: "0" } as UsuarioEntity;
        const nuevoModerador: ModeradorEntity = { id: "", usuario: invalidUsuario } as ModeradorEntity;

        await expect(() => service.create(nuevoModerador))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });

    it('create should throw an exception when usuario is already a moderador', async () => {
        const nuevoModerador: ModeradorEntity = { id: "", usuario } as ModeradorEntity;
        await expect(() => service.create(nuevoModerador))
            .rejects.toHaveProperty("message", "The usuario is already a moderador");
    });

    it('findAll should return all moderadores', async () => {
        const moderadores = await service.findAll();
        expect(moderadores.length).toBe(1);
    });

    it('findOne should return a moderador by id', async () => {
        const result = await service.findOne(moderador.id);
        expect(result).not.toBeNull();
        expect(result.usuario.id).toBe(usuario.id);
    });

    it('findOne should throw an exception for an invalid moderador', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The moderador with the given id was not found");
    });

    it('delete should remove a moderador', async () => {
        await service.delete(moderador.id);
        const deleted = await moderadorRepository.findOne({ where: { id: moderador.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid moderador', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The moderador with the given id was not found");
    });
});