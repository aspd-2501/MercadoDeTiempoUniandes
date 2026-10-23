/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SolicitudAyudaService } from './solicitud-ayuda.service';
import { SolicitudAyudaEntity } from './solicitud-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { PerfilOrganizacionEntity } from '../perfil-organizacion/perfil-organizacion.entity';

describe('SolicitudAyudaService', () => {
    let service: SolicitudAyudaService;
    let solicitudRepository: Repository<SolicitudAyudaEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>;
    let perfilOrganizacionRepository: Repository<PerfilOrganizacionEntity>;

    let autor: PerfilMiembroEntity;
    let prestador: PerfilOrganizacionEntity;
    let solicitud: SolicitudAyudaEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [SolicitudAyudaService],
        }).compile();

        service = module.get<SolicitudAyudaService>(SolicitudAyudaService);
        solicitudRepository = module.get<Repository<SolicitudAyudaEntity>>(getRepositoryToken(SolicitudAyudaEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        servicioOfrecidoRepository = module.get<Repository<ServicioOfrecidoEntity>>(getRepositoryToken(ServicioOfrecidoEntity));
        perfilOrganizacionRepository = module.get<Repository<PerfilOrganizacionEntity>>(getRepositoryToken(PerfilOrganizacionEntity));

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

    const createOrganizacion = async (): Promise<PerfilOrganizacionEntity> => {
        const perfilDeLaOrganizacion = await createPerfil();
        return await perfilOrganizacionRepository.save({ numMiembros: 1, perfil: perfilDeLaOrganizacion });
    };

    const seedDatabase = async () => {
        await solicitudRepository.clear();
        await servicioOfrecidoRepository.clear();
        await perfilOrganizacionRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        autor = await createPerfil();
        prestador = await createOrganizacion();

        solicitud = await solicitudRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 2,
            perfilAutor: autor,
            prestador,
        });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a solicitud ayuda as not aceptada', async () => {
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: true,
            fechaCreacion: faker.date.recent(),
            horas: 3,
            perfilAutor: autor,
            prestador,
        } as SolicitudAyudaEntity;

        const result = await service.create(nuevaSolicitud);
        expect(result).not.toBeNull();
        expect(result.aceptada).toBe(false);
        expect(result.prestador.id).toBe(prestador.id);
    });

    it('create should throw an exception without a prestador', async () => {
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: autor,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "A solicitud ayuda must have a prestador");
    });

    it('create should throw an exception for an invalid prestador', async () => {
        const invalidOrganizacion: PerfilOrganizacionEntity = { id: "0" } as PerfilOrganizacionEntity;
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: autor,
            prestador: invalidOrganizacion,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "The perfil organizacion prestador with the given id was not found");
    });

    it('create should throw an exception when the autor is the perfil of the prestador', async () => {
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: prestador.perfil,
            prestador,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "The perfil autor cannot be the prestador of its own solicitud");
    });

    it('create should throw an exception when the servicio ofrecido does not belong to the prestador', async () => {
        const servicioDeOtro = await servicioOfrecidoRepository.save({
            titulo: faker.lorem.words(2),
            descripcion: faker.lorem.sentence(),
            visible: true,
            perfil: autor,
        });
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: autor,
            prestador,
            servicioOfrecido: servicioDeOtro,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "The servicio ofrecido does not belong to the prestador");
    });

    it('create should throw an exception without a perfil autor', async () => {
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "A solicitud ayuda must have a perfil autor");
    });

    it('create should throw an exception for an invalid perfil autor', async () => {
        const invalidPerfil: PerfilMiembroEntity = { id: "0" } as PerfilMiembroEntity;
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: invalidPerfil,
            prestador,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "The perfil autor with the given id was not found");
    });

    it('create should throw an exception for an invalid servicio ofrecido', async () => {
        const invalidServicio: ServicioOfrecidoEntity = { id: "0" } as ServicioOfrecidoEntity;
        const nuevaSolicitud: SolicitudAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            aceptada: false,
            fechaCreacion: faker.date.recent(),
            horas: 1,
            perfilAutor: autor,
            prestador,
            servicioOfrecido: invalidServicio,
        } as SolicitudAyudaEntity;

        await expect(() => service.create(nuevaSolicitud))
            .rejects.toHaveProperty("message", "The servicio ofrecido with the given id was not found");
    });

    it('findOne should return a solicitud ayuda by id', async () => {
        const result = await service.findOne(solicitud.id);
        expect(result).not.toBeNull();
        expect(result.titulo).toBe(solicitud.titulo);
    });

    it('findOne should throw an exception for an invalid solicitud ayuda', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The solicitud ayuda with the given id was not found");
    });

    it('update should modify a solicitud ayuda', async () => {
        solicitud.titulo = faker.lorem.words(3);
        const updated = await service.update(solicitud.id, solicitud);
        expect(updated.titulo).toBe(solicitud.titulo);
    });

    it('update should throw an exception for an invalid solicitud ayuda', async () => {
        const invalida = { ...solicitud, titulo: faker.lorem.words(3) };
        await expect(() => service.update("0", invalida))
            .rejects.toHaveProperty("message", "The solicitud ayuda with the given id was not found");
    });

    it('aceptarSolicitud should mark a solicitud as aceptada', async () => {
        const result = await service.aceptarSolicitud(solicitud.id);
        expect(result.aceptada).toBe(true);
        expect(result.prestador.id).toBe(prestador.id);
    });

    it('aceptarSolicitud should throw an exception for an invalid solicitud ayuda', async () => {
        await expect(() => service.aceptarSolicitud("0"))
            .rejects.toHaveProperty("message", "The solicitud ayuda with the given id was not found");
    });

    it('aceptarSolicitud should throw an exception when already aceptada', async () => {
        await service.aceptarSolicitud(solicitud.id);
        await expect(() => service.aceptarSolicitud(solicitud.id))
            .rejects.toHaveProperty("message", "The solicitud ayuda is already aceptada");
    });

    it('delete should remove a solicitud ayuda', async () => {
        await service.delete(solicitud.id);
        const deleted = await solicitudRepository.findOne({ where: { id: solicitud.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid solicitud ayuda', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The solicitud ayuda with the given id was not found");
    });
});