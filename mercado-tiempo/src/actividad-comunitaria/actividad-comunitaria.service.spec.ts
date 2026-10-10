/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/actividad-comunitaria.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ActividadComunitariaService } from './actividad-comunitaria.service';
import { ActividadComunitariaEntity } from './actividad-comunitaria.entity';
import { InscripcionActividadEntity } from './inscripcion-actividad.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { OrganizacionInstitucionalEntity } from '../organizacion-institucional/organizacion-institucional.entity';

describe('ActividadComunitariaService', () => {
    let service: ActividadComunitariaService;
    let actividadRepository: Repository<ActividadComunitariaEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let inscripcionRepository: Repository<InscripcionActividadEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let organizacionRepository: Repository<OrganizacionInstitucionalEntity>;

    let actividad: ActividadComunitariaEntity;
    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ActividadComunitariaService],
        }).compile();

        service = module.get<ActividadComunitariaService>(ActividadComunitariaService);
        actividadRepository = module.get<Repository<ActividadComunitariaEntity>>(getRepositoryToken(ActividadComunitariaEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        inscripcionRepository = module.get<Repository<InscripcionActividadEntity>>(getRepositoryToken(InscripcionActividadEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        organizacionRepository = module.get<Repository<OrganizacionInstitucionalEntity>>(getRepositoryToken(OrganizacionInstitucionalEntity));

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
        await inscripcionRepository.clear();
        await actividadRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();
        await organizacionRepository.clear();

        const organizacion: OrganizacionInstitucionalEntity = await organizacionRepository.save({
            nombre: faker.company.name(),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
        });

        actividad = await actividadRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            cupo: 10,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            organizacion,
        });

        perfilesList = [];
        for (let i = 0; i < 5; i++) {
            const perfil = await createPerfil();
            await inscripcionRepository.save({ idActividad: actividad.id, idPerfil: perfil.id });
            perfilesList.push(perfil);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('addPerfilActividad should add a perfil to an actividad', async () => {
        const newPerfil = await createPerfil();
        const result = await service.addPerfilActividad(actividad.id, newPerfil.id);
        expect(result.inscritos.length).toBe(6);
        expect(result.inscritos.some(i => i.idPerfil === newPerfil.id)).toBe(true);
    });

    it('addPerfilActividad should throw an exception for an invalid perfil', async () => {
        await expect(() => service.addPerfilActividad(actividad.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('addPerfilActividad should throw an exception for an invalid actividad', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.addPerfilActividad("0", newPerfil.id))
            .rejects.toHaveProperty("message", "The actividad comunitaria with the given id was not found");
    });

    it('addPerfilActividad should throw an exception for an already enrolled perfil', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.addPerfilActividad(actividad.id, perfil.id))
            .rejects.toHaveProperty("message", "The perfil is already enrolled in the actividad");
    });

    it('findPerfilByActividadIdPerfilId should return a perfil by actividad', async () => {
        const perfil = perfilesList[0];
        const result = await service.findPerfilByActividadIdPerfilId(actividad.id, perfil.id);
        expect(result).not.toBeNull();
        expect(result.id).toBe(perfil.id);
    });

    it('findPerfilByActividadIdPerfilId should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findPerfilByActividadIdPerfilId(actividad.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('findPerfilByActividadIdPerfilId should throw an exception for an invalid actividad', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.findPerfilByActividadIdPerfilId("0", perfil.id))
            .rejects.toHaveProperty("message", "The actividad comunitaria with the given id was not found");
    });

    it('findPerfilByActividadIdPerfilId should throw an exception for a perfil not associated to the actividad', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.findPerfilByActividadIdPerfilId(actividad.id, newPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not enrolled in the actividad");
    });

    it('findPerfilesByActividadId should return perfiles by actividad', async () => {
        const perfiles = await service.findPerfilesByActividadId(actividad.id);
        expect(perfiles.length).toBe(5);
    });

    it('findPerfilesByActividadId should throw an exception for an invalid actividad', async () => {
        await expect(() => service.findPerfilesByActividadId("0"))
            .rejects.toHaveProperty("message", "The actividad comunitaria with the given id was not found");
    });

    it('associatePerfilesActividad should update the perfiles list for an actividad', async () => {
        const newPerfil = await createPerfil();
        const result = await service.associatePerfilesActividad(actividad.id, [newPerfil]);
        expect(result.inscritos.length).toBe(1);
        expect(result.inscritos[0].idPerfil).toBe(newPerfil.id);
    });

    it('associatePerfilesActividad should throw an exception for an invalid actividad', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.associatePerfilesActividad("0", [newPerfil]))
            .rejects.toHaveProperty("message", "The actividad comunitaria with the given id was not found");
    });

    it('associatePerfilesActividad should throw an exception for an invalid perfil', async () => {
        const invalidPerfil = perfilesList[0];
        invalidPerfil.id = "0";
        await expect(() => service.associatePerfilesActividad(actividad.id, [invalidPerfil]))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deletePerfilActividad should remove a perfil from an actividad', async () => {
    const perfil = perfilesList[0];
    await service.deletePerfilActividad(actividad.id, perfil.id);

    const stored = await actividadRepository.findOne({
        where: { id: actividad.id },
        relations: { inscritos: true }
    });
    const deleted = stored!.inscritos.find(i => i.idPerfil === perfil.id);
    expect(deleted).toBeUndefined();
});

    it('deletePerfilActividad should throw an exception for an invalid perfil', async () => {
        await expect(() => service.deletePerfilActividad(actividad.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deletePerfilActividad should throw an exception for an invalid actividad', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.deletePerfilActividad("0", perfil.id))
            .rejects.toHaveProperty("message", "The actividad comunitaria with the given id was not found");
    });

    it('deletePerfilActividad should throw an exception for a non-associated perfil', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.deletePerfilActividad(actividad.id, newPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not enrolled in the actividad");
    });
});