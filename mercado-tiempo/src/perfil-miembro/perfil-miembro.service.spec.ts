/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PerfilMiembroService } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('PerfilMiembroService', () => {
    let service: PerfilMiembroService;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PerfilMiembroService],
        }).compile();

        service = module.get<PerfilMiembroService>(PerfilMiembroService);
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
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
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfilesList = [];
        for (let i = 0; i < 5; i++) {
            const usuario = await createUsuario();
            const perfil: PerfilMiembroEntity = await perfilRepository.save({
                imagen: faker.image.url(),
                descripcion: faker.lorem.sentence(),
                intereses: faker.lorem.words(3),
                estadoActividad: true,
                saldo: faker.number.int({ min: 0, max: 100 }),
                usuario,
            });
            perfilesList.push(perfil);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all perfiles', async () => {
        const perfiles: PerfilMiembroEntity[] = await service.findAll();
        expect(perfiles.length).toBe(perfilesList.length);
    });

    it('findOne should return a perfil by id', async () => {
        const stored: PerfilMiembroEntity = perfilesList[0];
        const perfil: PerfilMiembroEntity = await service.findOne(stored.id);
        expect(perfil).not.toBeNull();
        expect(perfil.descripcion).toBe(stored.descripcion);
        expect(perfil.usuario).not.toBeNull();
    });

    it('findOne should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    it('create should return a new perfil with its usuario', async () => {
        const usuario = await createUsuario();
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            intereses: faker.lorem.words(3),
            estadoActividad: true,
            saldo: faker.number.int({ min: 0, max: 100 }),
            usuario,
        } as PerfilMiembroEntity;

        const newPerfil: PerfilMiembroEntity = await service.create(perfil);
        expect(newPerfil).not.toBeNull();

        const stored: PerfilMiembroEntity | null = await perfilRepository.findOne({
            where: { id: newPerfil.id },
            relations: { usuario: true }
        });
        expect(stored).not.toBeNull();
        expect(stored!.usuario.id).toBe(usuario.id);
    });

    it('create should throw an exception without a usuario', async () => {
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            intereses: faker.lorem.words(3),
            estadoActividad: true,
            saldo: 0,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "A perfil miembro must have a usuario");
    });

    it('create should throw an exception for an invalid usuario', async () => {
        const invalidUsuario: UsuarioEntity = { id: "0" } as UsuarioEntity;
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            intereses: faker.lorem.words(3),
            estadoActividad: true,
            saldo: 0,
            usuario: invalidUsuario,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });

    it('create should throw an exception when usuario already has a perfil', async () => {
        const perfilExistente = perfilesList[0];
        const usuarioOcupado = await usuarioRepository.findOne({
            where: { id: perfilExistente.usuario.id }
        });

        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            intereses: faker.lorem.words(3),
            estadoActividad: true,
            saldo: 0,
            usuario: usuarioOcupado,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "The usuario already has a perfil miembro");
    });

    it('update should modify a perfil', async () => {
        const perfil: PerfilMiembroEntity = perfilesList[0];
        perfil.descripcion = faker.lorem.sentence();
        const updated: PerfilMiembroEntity = await service.update(perfil.id, perfil);
        expect(updated).not.toBeNull();
        expect(updated.descripcion).toBe(perfil.descripcion);
    });

    it('update should throw an exception for an invalid perfil', async () => {
        let perfil: PerfilMiembroEntity = perfilesList[0];
        perfil = { ...perfil, descripcion: faker.lorem.sentence() };
        await expect(() => service.update("0", perfil))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    it('delete should remove a perfil', async () => {
        const perfil: PerfilMiembroEntity = perfilesList[0];
        await service.delete(perfil.id);

        const deleted: PerfilMiembroEntity | null = await perfilRepository.findOne({ where: { id: perfil.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid perfil', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });
});