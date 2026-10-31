/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/disponibilidad-acuerdo.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { DisponibilidadAcuerdoService } from './disponibilidad-acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { Intervalo } from './coincidencia-horarios';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';

describe('DisponibilidadAcuerdoService', () => {
    let service: DisponibilidadAcuerdoService;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let horarioRepository: Repository<HorarioDisponibleEntity>;

    let autor: PerfilMiembroEntity;        // autor del post y prestador
    let receptor: PerfilMiembroEntity;
    let postAyuda: PostAyudaEntity;
    let acuerdo: AcuerdoEntity;            // de 2 horas

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [DisponibilidadAcuerdoService],
        }).compile();

        service = module.get<DisponibilidadAcuerdoService>(DisponibilidadAcuerdoService);
        acuerdoRepository = module.get<Repository<AcuerdoEntity>>(getRepositoryToken(AcuerdoEntity));
        participanteRepository = module.get<Repository<ParticipanteAcuerdoEntity>>(getRepositoryToken(ParticipanteAcuerdoEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get<Repository<PostAyudaEntity>>(getRepositoryToken(PostAyudaEntity));
        horarioRepository = module.get<Repository<HorarioDisponibleEntity>>(getRepositoryToken(HorarioDisponibleEntity));

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
            saldo: 50,
            usuario,
        });
    };

    const seedDatabase = async () => {
        await participanteRepository.clear();
        await horarioRepository.clear();
        await acuerdoRepository.clear();
        await postAyudaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        autor = await createPerfil();
        receptor = await createPerfil();

        postAyuda = await postAyudaRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 1,
            cupoLleno: false,
            horas: 2,
            fechaCreacion: faker.date.recent(),
            perfilAutor: autor,
        });

        acuerdo = await acuerdoRepository.save({
            horas: 2,
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: faker.date.future(),
            estado: EstadoAcuerdo.EN_CREACION,
            postAyuda,
        });

        await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: autor.id, rol: RolParticipante.PRESTADOR });
        await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: receptor.id, rol: RolParticipante.RECEPTOR });
    };

    // Franja del 10 de noviembre de 2026 entre dos horas (UTC)
    const f = (desde: number, hasta: number, dia = 10): Intervalo => ({
        inicio: new Date(Date.UTC(2026, 10, dia, desde)),
        fin: new Date(Date.UTC(2026, 10, dia, hasta)),
    });

    const acuerdoGuardado = async () =>
        (await acuerdoRepository.findOne({ where: { id: acuerdo.id }, relations: { horarioAcordado: true } }))!;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findDisponibilidad should be pendiente while nobody has sent availability', async () => {
        const result = await service.findDisponibilidad(acuerdo.id);
        expect(result.resultado.estado).toBe('pendiente');
        expect(result.participantes.length).toBe(2);
        expect(result.participantes.every(p => !p.envioDisponibilidad)).toBe(true);
        expect(result.horarioAcordado).toBeNull();
    });

    it('registrarDisponibilidad should stay pendiente until every participante sends it', async () => {
        const result = await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 12)]);
        expect(result.resultado.estado).toBe('pendiente');
        expect(result.participantes.find(p => p.perfilId === autor.id)!.envioDisponibilidad).toBe(true);
    });

    it('registrarDisponibilidad should assign the horario automatically when there is a compatible one', async () => {
        await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 12), f(14, 18)]);
        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(11, 12), f(15, 18)]);

        expect(result.resultado.estado).toBe('compatible');
        expect(new Date(result.horarioAcordado!.inicio).getUTCHours()).toBe(15);
        expect(new Date(result.horarioAcordado!.fin).getUTCHours()).toBe(17);

        const stored = await acuerdoGuardado();
        expect(stored.estado).toBe(EstadoAcuerdo.ACORDADO);
        expect(stored.horarioAcordado).not.toBeNull();
        expect(new Date(stored.fechaRealizacion).getTime()).toBe(f(15, 17).inicio.getTime());
    });

    it('registrarDisponibilidad should report insuficiente without assigning a horario', async () => {
        await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 10)]);
        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(9, 12)]);

        expect(result.resultado.estado).toBe('insuficiente');
        const stored = await acuerdoGuardado();
        expect(stored.horarioAcordado).toBeNull();
        expect(stored.estado).toBe(EstadoAcuerdo.EN_CREACION);
    });

    it('registrarDisponibilidad should report sin-coincidencia', async () => {
        await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 10)]);
        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(14, 18)]);
        expect(result.resultado.estado).toBe('sin-coincidencia');
    });

    it('registrarDisponibilidad should accept an empty list as no availability', async () => {
        await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 12)]);
        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, []);
        expect(result.resultado.estado).toBe('sin-coincidencia');
    });

    it('registrarDisponibilidad should replace the franjas sent before', async () => {
        await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(8, 10), f(11, 12)]);
        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(14, 18)]);

        const franjas = result.participantes.find(p => p.perfilId === receptor.id)!.franjas;
        expect(franjas.length).toBe(1);
        expect(new Date(franjas[0].inicio).getUTCHours()).toBe(14);
    });

    it('the franjas of the post count as the availability of its autor', async () => {
        await horarioRepository.save({ fechaInicio: f(13, 17).inicio, fechaFin: f(13, 17).fin, postAyuda, perfil: autor });

        const antes = await service.findDisponibilidad(acuerdo.id);
        expect(antes.participantes.find(p => p.perfilId === autor.id)!.envioDisponibilidad).toBe(true);

        const result = await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(14, 18)]);
        expect(result.resultado.estado).toBe('compatible');
        expect(new Date(result.horarioAcordado!.inicio).getUTCHours()).toBe(14);
    });

    it('registrarDisponibilidad should throw an exception when the acuerdo already has a horario acordado', async () => {
        await service.registrarDisponibilidad(acuerdo.id, autor.id, [f(8, 12)]);
        await service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(8, 12)]);
        await expect(() => service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(14, 18)]))
            .rejects.toHaveProperty("message", "The acuerdo already has a horario acordado");
    });

    it('registrarDisponibilidad should throw an exception for a perfil that is not a participant', async () => {
        const ajeno = await createPerfil();
        await expect(() => service.registrarDisponibilidad(acuerdo.id, ajeno.id, [f(8, 12)]))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    it('registrarDisponibilidad should throw an exception for a franja that ends before it starts', async () => {
        await expect(() => service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(12, 8)]))
            .rejects.toHaveProperty("message", "The fechaFin of a horario must be after its fechaInicio");
    });

    it('registrarDisponibilidad should throw an exception for a cancelado acuerdo', async () => {
        await acuerdoRepository.update(acuerdo.id, { estado: EstadoAcuerdo.CANCELADO });
        await expect(() => service.registrarDisponibilidad(acuerdo.id, receptor.id, [f(8, 12)]))
            .rejects.toHaveProperty("message", "The acuerdo is cancelado and cannot be modified");
    });

    it('findDisponibilidad should throw an exception for an invalid acuerdo', async () => {
        await expect(() => service.findDisponibilidad("0"))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });
});
