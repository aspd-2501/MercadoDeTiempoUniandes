/* eslint-disable prettier/prettier */
/* archivo: src/agenda-miembro/agenda-miembro.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AgendaMiembroService, FiltroAcuerdos } from './agenda-miembro.service';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from '../acuerdo/participante-acuerdo.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';
import { ActividadComunitariaEntity } from '../actividad-comunitaria/actividad-comunitaria.entity';
import { InscripcionActividadEntity } from '../actividad-comunitaria/inscripcion-actividad.entity';

describe('AgendaMiembroService', () => {
    let service: AgendaMiembroService;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let horarioRepository: Repository<HorarioDisponibleEntity>;
    let actividadRepository: Repository<ActividadComunitariaEntity>;
    let inscripcionRepository: Repository<InscripcionActividadEntity>;

    let miembro: PerfilMiembroEntity;
    let otro: PerfilMiembroEntity;
    let postAyuda: PostAyudaEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AgendaMiembroService],
        }).compile();

        service = module.get<AgendaMiembroService>(AgendaMiembroService);
        perfilRepository = module.get(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get(getRepositoryToken(UsuarioEntity));
        acuerdoRepository = module.get(getRepositoryToken(AcuerdoEntity));
        participanteRepository = module.get(getRepositoryToken(ParticipanteAcuerdoEntity));
        postAyudaRepository = module.get(getRepositoryToken(PostAyudaEntity));
        horarioRepository = module.get(getRepositoryToken(HorarioDisponibleEntity));
        actividadRepository = module.get(getRepositoryToken(ActividadComunitariaEntity));
        inscripcionRepository = module.get(getRepositoryToken(InscripcionActividadEntity));

        await seedDatabase();
    });

    const createPerfil = async (nombre: string): Promise<PerfilMiembroEntity> => {
        const usuario: UsuarioEntity = await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            contrasenia: faker.internet.password(),
        });

        return await perfilRepository.save({
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre,
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: 50,
            usuario,
        });
    };

    const seedDatabase = async () => {
        await inscripcionRepository.clear();
        await participanteRepository.clear();
        await horarioRepository.clear();
        await acuerdoRepository.clear();
        await actividadRepository.clear();
        await postAyudaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        miembro = await createPerfil('Ana');
        otro = await createPerfil('Tomás');

        postAyuda = await postAyudaRepository.save({
            titulo: 'Tutoría de cálculo',
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 1,
            cupoLleno: false,
            horas: 2,
            fechaCreacion: faker.date.recent(),
            perfilAutor: otro,
        });
    };

    // Fecha del noviembre de 2026 a una hora dada (UTC)
    const fecha = (dia: number, hora = 14) => new Date(Date.UTC(2026, 10, dia, hora));

    // Crea un acuerdo de "miembro" con "otro"; si se da un día, le asigna un horario acordado
    const crearAcuerdo = async (estado: EstadoAcuerdo, dia?: number): Promise<AcuerdoEntity> => {
        const acuerdo = await acuerdoRepository.save({
            horas: 2,
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: fecha(dia ?? 20),
            estado,
            postAyuda,
        });
        await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: otro.id, rol: RolParticipante.PRESTADOR });
        await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: miembro.id, rol: RolParticipante.RECEPTOR });

        if (dia !== undefined) {
            const horario = await horarioRepository.save({ fechaInicio: fecha(dia), fechaFin: fecha(dia, 16), acuerdo });
            await acuerdoRepository.update(acuerdo.id, { horarioAcordado: { id: horario.id } });
        }
        return acuerdo;
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // --- Acuerdos (RF-057) ---

    it('findAcuerdos should return every acuerdo of the miembro without filtro', async () => {
        await crearAcuerdo(EstadoAcuerdo.EN_CREACION);
        await crearAcuerdo(EstadoAcuerdo.REALIZADO);
        await crearAcuerdo(EstadoAcuerdo.CANCELADO);

        const result = await service.findAcuerdos(miembro.id);
        expect(result.length).toBe(3);
    });

    it('findAcuerdos should return the pendientes ordered by fechaRealizacion', async () => {
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 25);
        await crearAcuerdo(EstadoAcuerdo.EN_CREACION, 12);
        await crearAcuerdo(EstadoAcuerdo.EN_MODIFICACION, 18);
        await crearAcuerdo(EstadoAcuerdo.REALIZADO, 5);

        const result = await service.findAcuerdos(miembro.id, FiltroAcuerdos.PENDIENTES);
        expect(result.map(a => new Date(a.fechaRealizacion).getUTCDate())).toEqual([12, 18, 25]);
    });

    it('findAcuerdos should return the completados and the cancelados', async () => {
        await crearAcuerdo(EstadoAcuerdo.REALIZADO);
        await crearAcuerdo(EstadoAcuerdo.CANCELADO);
        await crearAcuerdo(EstadoAcuerdo.CANCELADO);

        expect((await service.findAcuerdos(miembro.id, FiltroAcuerdos.COMPLETADOS)).length).toBe(1);
        expect((await service.findAcuerdos(miembro.id, FiltroAcuerdos.CANCELADOS)).length).toBe(2);
    });

    it('findAcuerdos should not return acuerdos of other miembros', async () => {
        const ajeno = await createPerfil('Sofía');
        await crearAcuerdo(EstadoAcuerdo.EN_CREACION);
        expect((await service.findAcuerdos(ajeno.id)).length).toBe(0);
    });

    it('findAcuerdos should throw an exception for an invalid filtro', async () => {
        await expect(() => service.findAcuerdos(miembro.id, 'otros' as FiltroAcuerdos))
            .rejects.toHaveProperty("message", "The filtro must be pendientes, completados or cancelados");
    });

    it('findAcuerdos should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findAcuerdos("0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    // --- Calendario (RF-035) ---

    it('findCalendario should include only the scheduled acuerdos that are still vigentes', async () => {
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 10);
        await crearAcuerdo(EstadoAcuerdo.EN_MODIFICACION, 11);
        await crearAcuerdo(EstadoAcuerdo.EN_CREACION);          // sin horario acordado
        await crearAcuerdo(EstadoAcuerdo.REALIZADO, 12);
        await crearAcuerdo(EstadoAcuerdo.CANCELADO, 13);

        const result = await service.findCalendario(miembro.id);
        expect(result.map(e => new Date(e.inicio).getUTCDate())).toEqual([10, 11]);
    });

    it('findCalendario should describe each acuerdo with its titulo and the other participantes', async () => {
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 10);

        const [evento] = await service.findCalendario(miembro.id);
        expect(evento.tipo).toBe('ACUERDO');
        expect(evento.titulo).toBe('Tutoría de cálculo');
        expect(evento.participantes).toEqual(['Tomás']);
        expect(new Date(evento.fin).getUTCHours()).toBe(16);
    });

    it('findCalendario should include the actividades where the miembro is inscrito, in chronological order', async () => {
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 15);
        const actividad = await actividadRepository.save({
            titulo: 'Jornada de reciclaje',
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            cupo: 20,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
        });
        await horarioRepository.save({ fechaInicio: fecha(8), fechaFin: fecha(8, 18), actividad });
        await inscripcionRepository.save({ idActividad: actividad.id, idPerfil: miembro.id });

        const result = await service.findCalendario(miembro.id);
        expect(result.map(e => e.tipo)).toEqual(['ACTIVIDAD', 'ACUERDO']);
        expect(result[0].titulo).toBe('Jornada de reciclaje');
    });

    it('findCalendario should return only the eventos in the given range', async () => {
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 3);
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 10);
        await crearAcuerdo(EstadoAcuerdo.ACORDADO, 20);

        const result = await service.findCalendario(miembro.id, fecha(9, 0), fecha(16, 0));
        expect(result.map(e => new Date(e.inicio).getUTCDate())).toEqual([10]);
    });

    it('findCalendario should throw an exception when hasta is before desde', async () => {
        await expect(() => service.findCalendario(miembro.id, fecha(16), fecha(9)))
            .rejects.toHaveProperty("message", "The hasta must be after desde");
    });

    it('findCalendario should throw an exception for an invalid date', async () => {
        await expect(() => service.findCalendario(miembro.id, new Date('no-es-fecha')))
            .rejects.toHaveProperty("message", "The desde and hasta must be valid dates");
    });
});
