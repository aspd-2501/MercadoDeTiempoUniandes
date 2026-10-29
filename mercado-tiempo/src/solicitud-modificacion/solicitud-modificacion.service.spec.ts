/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { SolicitudModificacionService } from './solicitud-modificacion.service';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { AprobacionModificacionEntity } from './aprobacion-modificacion.entity';
import { EstadoSolicitudModificacion, TipoSolicitudModificacion } from './estado-solicitud-modificacion.enum';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from '../acuerdo/participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';

describe('SolicitudModificacionService', () => {
    let service: SolicitudModificacionService;
    let solicitudRepository: Repository<SolicitudModificacionEntity>;
    let aprobacionRepository: Repository<AprobacionModificacionEntity>;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;

    let acuerdo: AcuerdoEntity;
    let participantes: PerfilMiembroEntity[];
    let ajeno: PerfilMiembroEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [SolicitudModificacionService],
        }).compile();

        service = module.get<SolicitudModificacionService>(SolicitudModificacionService);
        solicitudRepository = module.get<Repository<SolicitudModificacionEntity>>(getRepositoryToken(SolicitudModificacionEntity));
        aprobacionRepository = module.get<Repository<AprobacionModificacionEntity>>(getRepositoryToken(AprobacionModificacionEntity));
        acuerdoRepository = module.get<Repository<AcuerdoEntity>>(getRepositoryToken(AcuerdoEntity));
        participanteRepository = module.get<Repository<ParticipanteAcuerdoEntity>>(getRepositoryToken(ParticipanteAcuerdoEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get<Repository<PostAyudaEntity>>(getRepositoryToken(PostAyudaEntity));

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
            saldo: faker.number.int({ min: 20, max: 100 }),
            usuario,
        });
    };

    const seedDatabase = async () => {
        await aprobacionRepository.clear();
        await solicitudRepository.clear();
        await participanteRepository.clear();
        await acuerdoRepository.clear();
        await postAyudaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        participantes = [await createPerfil(), await createPerfil(), await createPerfil()];
        ajeno = await createPerfil();

        const postAyuda = await postAyudaRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 2,
            cupoLleno: false,
            horas: 2,
            fechaCreacion: faker.date.recent(),
            perfilAutor: participantes[0],
        });

        acuerdo = await acuerdoRepository.save({
            horas: 2,
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: faker.date.future(),
            estado: EstadoAcuerdo.ACORDADO,
            postAyuda,
        });

        const roles = [RolParticipante.PRESTADOR, RolParticipante.RECEPTOR, RolParticipante.RECEPTOR];
        for (let i = 0; i < participantes.length; i++) {
            await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: participantes[i].id, rol: roles[i] });
        }
    };

    const modificacion = (solicitante: PerfilMiembroEntity, horas = 5): SolicitudModificacionEntity =>
        ({ tipo: TipoSolicitudModificacion.MODIFICACION, horas, fechaRealizacion: faker.date.future(), solicitante }) as SolicitudModificacionEntity;

    const cancelacion = (solicitante: PerfilMiembroEntity): SolicitudModificacionEntity =>
        ({ tipo: TipoSolicitudModificacion.CANCELACION, solicitante }) as SolicitudModificacionEntity;

    const acuerdoGuardado = async () => (await acuerdoRepository.findOne({ where: { id: acuerdo.id } }))!;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // --- create ---

    it('create should save a pending solicitud approved by its solicitante', async () => {
        const result = await service.create(acuerdo.id, modificacion(participantes[0]));
        expect(result.estado).toBe(EstadoSolicitudModificacion.PENDIENTE);
        expect(result.aprobaciones.length).toBe(1);

        const stored = await acuerdoGuardado();
        expect(stored.estado).toBe(EstadoAcuerdo.EN_MODIFICACION);
        expect(stored.horas).toBe(2);
    });

    it('create should throw an exception for an invalid acuerdo', async () => {
        await expect(() => service.create("0", modificacion(participantes[0])))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('create should throw an exception for a solicitante that is not a participant', async () => {
        await expect(() => service.create(acuerdo.id, modificacion(ajeno)))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    it('create should throw an exception when there is already a pending solicitud', async () => {
        await service.create(acuerdo.id, modificacion(participantes[0]));
        await expect(() => service.create(acuerdo.id, cancelacion(participantes[1])))
            .rejects.toHaveProperty("message", "The acuerdo already has a pending solicitud de modificacion");
    });

    it('create should throw an exception for a modificacion without changes', async () => {
        const sinCambios = { tipo: TipoSolicitudModificacion.MODIFICACION, solicitante: participantes[0] } as SolicitudModificacionEntity;
        await expect(() => service.create(acuerdo.id, sinCambios))
            .rejects.toHaveProperty("message", "A modificacion must change the horas or the fechaRealizacion");
    });

    it('create should throw an exception for a cancelado acuerdo', async () => {
        await acuerdoRepository.update(acuerdo.id, { estado: EstadoAcuerdo.CANCELADO });
        await expect(() => service.create(acuerdo.id, modificacion(participantes[0])))
            .rejects.toHaveProperty("message", "The acuerdo is cancelado and cannot be modified");
    });

    it('create should throw an exception when a RECEPTOR cannot pay the new horas', async () => {
        await perfilRepository.update(participantes[1].id, { saldo: 3 });
        await expect(() => service.create(acuerdo.id, modificacion(participantes[0], 4)))
            .rejects.toHaveProperty("message", "A RECEPTOR does not have enough saldo to pay its share of the acuerdo");
    });

    // --- aprobar: modificación ---

    it('aprobar should apply the modificacion only when all participantes approve', async () => {
        const solicitud = await service.create(acuerdo.id, modificacion(participantes[0], 6));

        await service.aprobar(acuerdo.id, solicitud.id, participantes[1].id);
        expect((await acuerdoGuardado()).horas).toBe(2);

        const result = await service.aprobar(acuerdo.id, solicitud.id, participantes[2].id);
        expect(result.estado).toBe(EstadoSolicitudModificacion.APROBADA);

        const stored = await acuerdoGuardado();
        expect(stored.horas).toBe(6);
        expect(stored.estado).toBe(EstadoAcuerdo.ACORDADO);
    });

    it('aprobar should throw an exception when the perfil already approved', async () => {
        const solicitud = await service.create(acuerdo.id, modificacion(participantes[0]));
        await expect(() => service.aprobar(acuerdo.id, solicitud.id, participantes[0].id))
            .rejects.toHaveProperty("message", "The perfil already approved the solicitud de modificacion");
    });

    it('aprobar should throw an exception for a perfil that is not a participant', async () => {
        const solicitud = await service.create(acuerdo.id, modificacion(participantes[0]));
        await expect(() => service.aprobar(acuerdo.id, solicitud.id, ajeno.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    it('aprobar should throw an exception for a solicitud that is no longer pending', async () => {
        const solicitud = await service.create(acuerdo.id, modificacion(participantes[0]));
        await service.rechazar(acuerdo.id, solicitud.id, participantes[1].id);
        await expect(() => service.aprobar(acuerdo.id, solicitud.id, participantes[2].id))
            .rejects.toHaveProperty("message", "The solicitud de modificacion is no longer pending");
    });

    // --- rechazar ---

    it('rechazar should discard a modificacion and restore the acuerdo', async () => {
        const solicitud = await service.create(acuerdo.id, modificacion(participantes[0], 9));
        const result = await service.rechazar(acuerdo.id, solicitud.id, participantes[2].id);
        expect(result.estado).toBe(EstadoSolicitudModificacion.RECHAZADA);

        const stored = await acuerdoGuardado();
        expect(stored.horas).toBe(2);
        expect(stored.estado).toBe(EstadoAcuerdo.ACORDADO);
    });

    it('rechazar should throw an exception for a cancelacion', async () => {
        const solicitud = await service.create(acuerdo.id, cancelacion(participantes[0]));
        await expect(() => service.rechazar(acuerdo.id, solicitud.id, participantes[1].id))
            .rejects.toHaveProperty("message", "A solicitud de cancelacion cannot be rejected; it needs the approval of all participantes");
    });

    // --- cancelación ---

    it('aprobar should cancel the acuerdo when all participantes approve a cancelacion', async () => {
        const solicitud = await service.create(acuerdo.id, cancelacion(participantes[1]));

        await service.aprobar(acuerdo.id, solicitud.id, participantes[0].id);
        expect((await acuerdoGuardado()).estado).toBe(EstadoAcuerdo.EN_MODIFICACION);

        await service.aprobar(acuerdo.id, solicitud.id, participantes[2].id);
        expect((await acuerdoGuardado()).estado).toBe(EstadoAcuerdo.CANCELADO);
    });

    // --- retirar ---

    it('retirar should let the solicitante withdraw and restore the acuerdo', async () => {
        const solicitud = await service.create(acuerdo.id, cancelacion(participantes[1]));
        const result = await service.retirar(acuerdo.id, solicitud.id, participantes[1].id);
        expect(result.estado).toBe(EstadoSolicitudModificacion.RETIRADA);
        expect((await acuerdoGuardado()).estado).toBe(EstadoAcuerdo.ACORDADO);
    });

    it('retirar should throw an exception for a perfil that is not the solicitante', async () => {
        const solicitud = await service.create(acuerdo.id, cancelacion(participantes[1]));
        await expect(() => service.retirar(acuerdo.id, solicitud.id, participantes[0].id))
            .rejects.toHaveProperty("message", "Only the solicitante can withdraw the solicitud de modificacion");
    });

    // --- consultas ---

    it('findAllByAcuerdoId should return the history of solicitudes', async () => {
        const primera = await service.create(acuerdo.id, modificacion(participantes[0]));
        await service.rechazar(acuerdo.id, primera.id, participantes[1].id);
        await service.create(acuerdo.id, cancelacion(participantes[2]));

        const result = await service.findAllByAcuerdoId(acuerdo.id);
        expect(result.length).toBe(2);
    });

    it('findOne should throw an exception for an invalid solicitud', async () => {
        await expect(() => service.findOne(acuerdo.id, "0"))
            .rejects.toHaveProperty("message", "The solicitud de modificacion with the given id was not found");
    });
});
