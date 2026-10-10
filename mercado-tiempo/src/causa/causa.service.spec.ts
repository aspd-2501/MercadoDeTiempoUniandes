/* eslint-disable prettier/prettier */
/* archivo: src/causa/causa.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { CausaService } from './causa.service';
import { CausaEntity } from './causa.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('CausaService', () => {
    let service: CausaService;
    let causaRepository: Repository<CausaEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let causasList: CausaEntity[];
    let perfil: PerfilMiembroEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [CausaService],
        }).compile();

        service = module.get<CausaService>(CausaService);
        causaRepository = module.get<Repository<CausaEntity>>(getRepositoryToken(CausaEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));

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
        await causaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();

        causasList = [];
        for (let i = 0; i < 5; i++) {
            const causa: CausaEntity = await causaRepository.save({
                nombre: faker.company.name(),
                descripcion: faker.lorem.sentence(),
                imagen: faker.image.url(),
                perfilCreador: perfil,
                perfilReceptor: perfil,
            });
            causasList.push(causa);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all causas', async () => {
        const causas: CausaEntity[] = await service.findAll();
        expect(causas.length).toBe(causasList.length);
    });

    it('findOne should return a causa by id', async () => {
        const storedCausa: CausaEntity = causasList[0];
        const causa: CausaEntity = await service.findOne(storedCausa.id);
        expect(causa).not.toBeNull();
        expect(causa.nombre).toBe(storedCausa.nombre);
        expect(causa.descripcion).toBe(storedCausa.descripcion);
    });

    it('findOne should throw an exception for an invalid causa', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The causa with the given id was not found");
    });

    it('create should return a new causa with the same perfil as creador and receptor', async () => {
        const causa: CausaEntity = {
            id: "",
            nombre: faker.company.name(),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            perfilCreador: perfil,
            perfilReceptor: perfil,
        } as CausaEntity;

        const newCausa: CausaEntity = await service.create(causa);
        expect(newCausa).not.toBeNull();

        const storedCausa: CausaEntity | null = await causaRepository.findOne({
            where: { id: newCausa.id },
            relations: { perfilCreador: true, perfilReceptor: true }
        });
        expect(storedCausa).not.toBeNull();
        expect(storedCausa!.perfilCreador.id).toBe(perfil.id);
        expect(storedCausa!.perfilReceptor.id).toBe(perfil.id);
    });

    it('create should return a new causa with different perfiles for creador and receptor', async () => {
        const otroPerfil = await createPerfil();
        const causa: CausaEntity = {
            id: "",
            nombre: faker.company.name(),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            perfilCreador: perfil,
            perfilReceptor: otroPerfil,
        } as CausaEntity;

        const newCausa: CausaEntity = await service.create(causa);

        const storedCausa: CausaEntity | null = await causaRepository.findOne({
            where: { id: newCausa.id },
            relations: { perfilCreador: true, perfilReceptor: true }
        });
        expect(storedCausa!.perfilCreador.id).toBe(perfil.id);
        expect(storedCausa!.perfilReceptor.id).toBe(otroPerfil.id);
    });

    it('update should modify a causa', async () => {
        const causa: CausaEntity = causasList[0];
        causa.nombre = faker.company.name();
        const updatedCausa: CausaEntity = await service.update(causa.id, causa);
        expect(updatedCausa).not.toBeNull();
        expect(updatedCausa.nombre).toBe(causa.nombre);
    });

    it('update should throw an exception for an invalid causa', async () => {
        let causa: CausaEntity = causasList[0];
        causa = { ...causa, nombre: faker.company.name() };
        await expect(() => service.update("0", causa))
            .rejects.toHaveProperty("message", "The causa with the given id was not found");
    });

    it('delete should remove a causa', async () => {
        const causa: CausaEntity = causasList[0];
        await service.delete(causa.id);

        const deletedCausa: CausaEntity | null = await causaRepository.findOne({ where: { id: causa.id } });
        expect(deletedCausa).toBeNull();
    });

    it('delete should throw an exception for an invalid causa', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The causa with the given id was not found");
    });
});