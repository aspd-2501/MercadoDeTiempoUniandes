/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { HorarioDisponibleService } from './horario-disponible.service';
import { HorarioDisponibleEntity } from './horario-disponible.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';

describe('HorarioDisponibleService', () => {
    let service: HorarioDisponibleService;
    let horarioRepository: Repository<HorarioDisponibleEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let solicitudRepository: Repository<SolicitudAyudaEntity>;

    let perfil: PerfilMiembroEntity;
    let postAyuda: PostAyudaEntity;
    let solicitud: SolicitudAyudaEntity;
    let acuerdo: AcuerdoEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [HorarioDisponibleService],
        }).compile();

        service = module.get<HorarioDisponibleService>(HorarioDisponibleService);
        horarioRepository = module.get<Repository<HorarioDisponibleEntity>>(getRepositoryToken(HorarioDisponibleEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get<Repository<PostAyudaEntity>>(getRepositoryToken(PostAyudaEntity));
        acuerdoRepository = module.get<Repository<AcuerdoEntity>>(getRepositoryToken(AcuerdoEntity));
        solicitudRepository = module.get<Repository<SolicitudAyudaEntity>>(getRepositoryToken(SolicitudAyudaEntity));

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
        await horarioRepository.clear();
        await postAyudaRepository.clear();
        await acuerdoRepository.clear();
        await solicitudRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();

        postAyuda = await postAyudaRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        });

        acuerdo = await acuerdoRepository.save({
            horas: 2,
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: faker.date.future(),
            finalizado: false,
            postAyuda,
        });

        const autorSolicitud = await createPerfil();
        solicitud = await solicitudRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: autorSolicitud,
        });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a horario with acuerdo as origen', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            acuerdo,
        } as HorarioDisponibleEntity;

        const result = await service.create(horario);
        expect(result).not.toBeNull();

        const stored = await horarioRepository.findOne({ where: { id: result.id }, relations: { acuerdo: true } });
        expect(stored!.acuerdo.id).toBe(acuerdo.id);
    });

    it('create should save a horario with solicitud as origen', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            solicitud,
        } as HorarioDisponibleEntity;

        const result = await service.create(horario);
        const stored = await horarioRepository.findOne({ where: { id: result.id }, relations: { solicitud: true } });
        expect(stored!.solicitud.id).toBe(solicitud.id);
    });

    it('create should save a horario with postAyuda as origen', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            postAyuda,
        } as HorarioDisponibleEntity;

        const result = await service.create(horario);
        const stored = await horarioRepository.findOne({ where: { id: result.id }, relations: { postAyuda: true } });
        expect(stored!.postAyuda.id).toBe(postAyuda.id);
    });

    it('create should throw an exception without a perfil', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            acuerdo,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "A horario disponible must have a perfil");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const invalidPerfil: PerfilMiembroEntity = { ...perfil, id: "0" } as PerfilMiembroEntity;
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil: invalidPerfil,
            acuerdo,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('create should throw an exception when fechaFin is before fechaInicio', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon({ days: 2 }),
            fechaFin: faker.date.soon(),
            perfil,
            acuerdo,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "fechaFin must be after fechaInicio");
    });

    it('create should throw an exception with no origen', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "A horario disponible must have exactly one origen: an acuerdo, a solicitud or a postAyuda");
    });

    it('create should throw an exception with more than one origen', async () => {
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            acuerdo,
            solicitud,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "A horario disponible must have exactly one origen: an acuerdo, a solicitud or a postAyuda");
    });

    it('create should throw an exception for an invalid acuerdo', async () => {
        const invalidAcuerdo: AcuerdoEntity = { ...acuerdo, id: "0" } as AcuerdoEntity;
        const horario: HorarioDisponibleEntity = {
            id: "",
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            acuerdo: invalidAcuerdo,
        } as HorarioDisponibleEntity;

        await expect(() => service.create(horario))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('findOne should return a horario by id', async () => {
        const saved = await horarioRepository.save({
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            acuerdo,
        });

        const result = await service.findOne(saved.id);
        expect(result).not.toBeNull();
    });

    it('findOne should throw an exception for an invalid horario', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The horario disponible with the given id was not found");
    });

    it('delete should remove a horario', async () => {
        const saved = await horarioRepository.save({
            fechaInicio: faker.date.soon(),
            fechaFin: faker.date.soon({ days: 2 }),
            perfil,
            acuerdo,
        });

        await service.delete(saved.id);
        const deleted = await horarioRepository.findOne({ where: { id: saved.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid horario', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The horario disponible with the given id was not found");
    });
});