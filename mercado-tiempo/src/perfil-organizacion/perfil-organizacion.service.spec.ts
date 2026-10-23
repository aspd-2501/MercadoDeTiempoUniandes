/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PerfilOrganizacionService } from './perfil-organizacion.service';
import { PerfilOrganizacionEntity } from './perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from './miembro-organizacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('PerfilOrganizacionService', () => {
    let service: PerfilOrganizacionService;
    let perfilOrganizacionRepository: Repository<PerfilOrganizacionEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let miembroRepository: Repository<MiembroOrganizacionEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let organizacion: PerfilOrganizacionEntity;
    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PerfilOrganizacionService],
        }).compile();

        service = module.get<PerfilOrganizacionService>(PerfilOrganizacionService);
        perfilOrganizacionRepository = module.get<Repository<PerfilOrganizacionEntity>>(getRepositoryToken(PerfilOrganizacionEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        miembroRepository = module.get<Repository<MiembroOrganizacionEntity>>(getRepositoryToken(MiembroOrganizacionEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));

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
        await miembroRepository.clear();
        await perfilOrganizacionRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        const perfilDeLaOrganizacion = await createPerfil();
        organizacion = await perfilOrganizacionRepository.save({ numMiembros: 3, perfil: perfilDeLaOrganizacion });

        perfilesList = [];
        for (let i = 0; i < 3; i++) {
            const perfil = await createPerfil();
            await miembroRepository.save({ idOrganizacion: organizacion.id, idPerfil: perfil.id });
            perfilesList.push(perfil);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findOne should return an organizacion by id', async () => {
        const result = await service.findOne(organizacion.id);
        expect(result).not.toBeNull();
        expect(result.miembros.length).toBe(3);
    });

    it('findOne should throw an exception for an invalid organizacion', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The perfil organizacion with the given id was not found");
    });

    it('create should return a new organizacion with numMiembros in 0', async () => {
        const nuevoPerfil = await createPerfil();
        const nuevaOrganizacion: PerfilOrganizacionEntity = {
            id: "",
            numMiembros: 999,
            perfil: nuevoPerfil,
        } as PerfilOrganizacionEntity;

        const result = await service.create(nuevaOrganizacion);
        expect(result.numMiembros).toBe(0);
    });

    it('create should throw an exception without a perfil', async () => {
        const nuevaOrganizacion: PerfilOrganizacionEntity = { id: "", numMiembros: 0 } as PerfilOrganizacionEntity;
        await expect(() => service.create(nuevaOrganizacion))
            .rejects.toHaveProperty("message", "A perfil organizacion must have a perfil");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const invalidPerfil: PerfilMiembroEntity = { id: "0" } as PerfilMiembroEntity;
        const nuevaOrganizacion: PerfilOrganizacionEntity = { id: "", numMiembros: 0, perfil: invalidPerfil } as PerfilOrganizacionEntity;
        await expect(() => service.create(nuevaOrganizacion))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('create should throw an exception when perfil already has a perfil organizacion', async () => {
        const perfilOcupado = await perfilRepository.findOne({ where: { id: organizacion.perfil.id } });
        const nuevaOrganizacion: PerfilOrganizacionEntity = { id: "", numMiembros: 0, perfil: perfilOcupado } as PerfilOrganizacionEntity;
        await expect(() => service.create(nuevaOrganizacion))
            .rejects.toHaveProperty("message", "The perfil already has a perfil organizacion");
    });

    it('delete should remove an organizacion', async () => {
        await service.delete(organizacion.id);
        const deleted = await perfilOrganizacionRepository.findOne({ where: { id: organizacion.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid organizacion', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The perfil organizacion with the given id was not found");
    });

    it('addMiembroOrganizacion should add a perfil and increment numMiembros', async () => {
        const nuevoPerfil = await createPerfil();
        const result = await service.addMiembroOrganizacion(organizacion.id, nuevoPerfil.id);
        expect(result.miembros.length).toBe(4);
        expect(result.numMiembros).toBe(4);
    });

    it('addMiembroOrganizacion should throw an exception for an invalid perfil', async () => {
        await expect(() => service.addMiembroOrganizacion(organizacion.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('addMiembroOrganizacion should throw an exception for an invalid organizacion', async () => {
        const nuevoPerfil = await createPerfil();
        await expect(() => service.addMiembroOrganizacion("0", nuevoPerfil.id))
            .rejects.toHaveProperty("message", "The perfil organizacion with the given id was not found");
    });

    it('addMiembroOrganizacion should throw an exception for an already enrolled perfil', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.addMiembroOrganizacion(organizacion.id, perfil.id))
            .rejects.toHaveProperty("message", "The perfil is already a miembro of the organizacion");
    });

    it('findMiembrosByOrganizacionId should return perfiles by organizacion', async () => {
        const perfiles = await service.findMiembrosByOrganizacionId(organizacion.id);
        expect(perfiles.length).toBe(3);
    });

    it('findMiembrosByOrganizacionId should throw an exception for an invalid organizacion', async () => {
        await expect(() => service.findMiembrosByOrganizacionId("0"))
            .rejects.toHaveProperty("message", "The perfil organizacion with the given id was not found");
    });

    it('deleteMiembroOrganizacion should remove a perfil and decrement numMiembros', async () => {
        const perfil = perfilesList[0];
        await service.deleteMiembroOrganizacion(organizacion.id, perfil.id);

        const stored = await perfilOrganizacionRepository.findOne({
            where: { id: organizacion.id },
            relations: { miembros: true }
        });
        expect(stored!.miembros.length).toBe(2);
        expect(stored!.numMiembros).toBe(2);
    });

    it('deleteMiembroOrganizacion should throw an exception for an invalid perfil', async () => {
        await expect(() => service.deleteMiembroOrganizacion(organizacion.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deleteMiembroOrganizacion should throw an exception for an invalid organizacion', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.deleteMiembroOrganizacion("0", perfil.id))
            .rejects.toHaveProperty("message", "The perfil organizacion with the given id was not found");
    });

    it('deleteMiembroOrganizacion should throw an exception for a non-member perfil', async () => {
        const nuevoPerfil = await createPerfil();
        await expect(() => service.deleteMiembroOrganizacion(organizacion.id, nuevoPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a miembro of the organizacion");
    });
});