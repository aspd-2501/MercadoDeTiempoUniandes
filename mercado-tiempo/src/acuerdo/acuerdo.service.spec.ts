/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

describe('AcuerdoService', () => {
    let service: AcuerdoService;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let transaccionRepository: Repository<TransaccionEntity>;

    let acuerdo: AcuerdoEntity;
    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AcuerdoService],
        }).compile();

        service = module.get<AcuerdoService>(AcuerdoService);
        acuerdoRepository = module.get<Repository<AcuerdoEntity>>(getRepositoryToken(AcuerdoEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        participanteRepository = module.get<Repository<ParticipanteAcuerdoEntity>>(getRepositoryToken(ParticipanteAcuerdoEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get<Repository<PostAyudaEntity>>(getRepositoryToken(PostAyudaEntity));
        transaccionRepository = module.get<Repository<TransaccionEntity>>(getRepositoryToken(TransaccionEntity));

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
        await transaccionRepository.clear();
        await participanteRepository.clear();
        await acuerdoRepository.clear();
        await postAyudaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        const autor = await createPerfil();
        const postAyuda = await postAyudaRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 1,
            cupoLleno: false,
            horas: faker.number.int({ min: 1, max: 10 }),
            fechaCreacion: faker.date.recent(),
            perfilAutor: autor,
        });

        acuerdo = await acuerdoRepository.save({
            horas: faker.number.int({ min: 1, max: 10 }),
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: faker.date.future(),
            estado: EstadoAcuerdo.EN_CREACION,
            postAyuda,
        });

        perfilesList = [];
        for (let i = 0; i < 2; i++) {
            const perfil = await createPerfil();
            const rol = i === 0 ? RolParticipante.PRESTADOR : RolParticipante.RECEPTOR;
            await participanteRepository.save({ idAcuerdo: acuerdo.id, idPerfil: perfil.id, rol });
            perfilesList.push(perfil);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('addParticipanteAcuerdo should add a participante to an acuerdo', async () => {
        const newPerfil = await createPerfil();
        const result = await service.addParticipanteAcuerdo(acuerdo.id, newPerfil.id, RolParticipante.RECEPTOR);
        expect(result.participantes.length).toBe(3);
        expect(result.participantes.some(p => p.idPerfil === newPerfil.id)).toBe(true);
    });

    it('addParticipanteAcuerdo should throw an exception for an invalid perfil', async () => {
        await expect(() => service.addParticipanteAcuerdo(acuerdo.id, "0", RolParticipante.PRESTADOR))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('addParticipanteAcuerdo should throw an exception for an invalid acuerdo', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.addParticipanteAcuerdo("0", newPerfil.id, RolParticipante.PRESTADOR))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('addParticipanteAcuerdo should throw an exception for an already enrolled perfil', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.addParticipanteAcuerdo(acuerdo.id, perfil.id, RolParticipante.PRESTADOR))
            .rejects.toHaveProperty("message", "The perfil is already a participant in the acuerdo");
    });

    it('findParticipanteByAcuerdoIdPerfilId should return a participante by acuerdo', async () => {
        const perfil = perfilesList[0];
        const result = await service.findParticipanteByAcuerdoIdPerfilId(acuerdo.id, perfil.id);
        expect(result).not.toBeNull();
        expect(result.idPerfil).toBe(perfil.id);
        expect(result.rol).toBe(RolParticipante.PRESTADOR);
    });

    it('findParticipanteByAcuerdoIdPerfilId should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findParticipanteByAcuerdoIdPerfilId(acuerdo.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('findParticipanteByAcuerdoIdPerfilId should throw an exception for an invalid acuerdo', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.findParticipanteByAcuerdoIdPerfilId("0", perfil.id))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('findParticipanteByAcuerdoIdPerfilId should throw an exception for a perfil not associated to the acuerdo', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.findParticipanteByAcuerdoIdPerfilId(acuerdo.id, newPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    it('findParticipantesByAcuerdoId should return participantes by acuerdo', async () => {
        const participantes = await service.findParticipantesByAcuerdoId(acuerdo.id);
        expect(participantes.length).toBe(2);
    });

    it('findParticipantesByAcuerdoId should throw an exception for an invalid acuerdo', async () => {
        await expect(() => service.findParticipantesByAcuerdoId("0"))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('associateParticipantesAcuerdo should update the participantes list for an acuerdo', async () => {
        const newPerfil = await createPerfil();
        const result = await service.associateParticipantesAcuerdo(acuerdo.id, [
            { perfilId: newPerfil.id, rol: RolParticipante.PRESTADOR }
        ]);
        expect(result.participantes.length).toBe(1);
        expect(result.participantes[0].idPerfil).toBe(newPerfil.id);
    });

    it('associateParticipantesAcuerdo should throw an exception for an invalid acuerdo', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.associateParticipantesAcuerdo("0", [
            { perfilId: newPerfil.id, rol: RolParticipante.PRESTADOR }
        ])).rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('associateParticipantesAcuerdo should throw an exception for an invalid perfil', async () => {
        await expect(() => service.associateParticipantesAcuerdo(acuerdo.id, [
            { perfilId: "0", rol: RolParticipante.PRESTADOR }
        ])).rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deleteParticipanteAcuerdo should remove a participante from an acuerdo', async () => {
        const perfil = perfilesList[0];
        await service.deleteParticipanteAcuerdo(acuerdo.id, perfil.id);

        const stored = await acuerdoRepository.findOne({ where: { id: acuerdo.id }, relations: { participantes: true } });
        const deleted = stored!.participantes.find(p => p.idPerfil === perfil.id);
        expect(deleted).toBeUndefined();
    });

    it('deleteParticipanteAcuerdo should throw an exception for an invalid perfil', async () => {
        await expect(() => service.deleteParticipanteAcuerdo(acuerdo.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deleteParticipanteAcuerdo should throw an exception for an invalid acuerdo', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.deleteParticipanteAcuerdo("0", perfil.id))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('deleteParticipanteAcuerdo should throw an exception for a non-associated perfil', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.deleteParticipanteAcuerdo(acuerdo.id, newPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    // --- Confirmación de prestación y transferencia de horas ---

    // Deja el acuerdo listo para confirmar: acordado y con la fecha ya pasada
    const prepararParaConfirmar = async () => {
        await acuerdoRepository.update(acuerdo.id, { estado: EstadoAcuerdo.ACORDADO, fechaRealizacion: faker.date.recent() });
    };

    const confirmarTodos = async () => {
        for (const perfil of perfilesList)
            await service.confirmarPrestacion(acuerdo.id, perfil.id);
    };

    const saldoDe = async (perfil: PerfilMiembroEntity) =>
        (await perfilRepository.findOne({ where: { id: perfil.id } }))!.saldo;

    it('confirmarPrestacion should register the confirmation without moving horas', async () => {
        await prepararParaConfirmar();
        const saldoAntes = await saldoDe(perfilesList[1]);

        const result = await service.confirmarPrestacion(acuerdo.id, perfilesList[0].id);
        expect(result.estado).toBe(EstadoAcuerdo.ACORDADO);
        expect(result.participantes.find(p => p.idPerfil === perfilesList[0].id)!.confirmoPrestacion).toBe(true);
        expect(await saldoDe(perfilesList[1])).toBe(saldoAntes);
    });

    it('confirmarPrestacion should transfer the horas when all participantes confirm', async () => {
        await prepararParaConfirmar();
        const [prestador, receptor] = perfilesList;
        const saldoPrestador = await saldoDe(prestador);
        const saldoReceptor = await saldoDe(receptor);

        await confirmarTodos();

        const stored = await acuerdoRepository.findOne({ where: { id: acuerdo.id } });
        expect(stored!.estado).toBe(EstadoAcuerdo.REALIZADO);
        expect(await saldoDe(prestador)).toBe(saldoPrestador + acuerdo.horas);
        expect(await saldoDe(receptor)).toBe(saldoReceptor - acuerdo.horas);
    });

    it('confirmarPrestacion should save one transaccion per participante', async () => {
        await prepararParaConfirmar();
        await confirmarTodos();

        const transacciones = await transaccionRepository.find({ relations: { perfil: true } });
        expect(transacciones.length).toBe(2);

        const delReceptor = transacciones.find(t => t.perfil.id === perfilesList[1].id)!;
        expect(delReceptor.tipo).toBe(TipoTransaccion.SERVICIO_RECIBIDO);
        expect(delReceptor.horas).toBe(-acuerdo.horas);
    });

    it('confirmarPrestacion should charge every RECEPTOR and pay the PRESTADOR only the horas of the acuerdo', async () => {
        await prepararParaConfirmar();
        const otroReceptor = await createPerfil();
        await service.addParticipanteAcuerdo(acuerdo.id, otroReceptor.id, RolParticipante.RECEPTOR);
        const saldoPrestador = await saldoDe(perfilesList[0]);
        const saldoOtro = await saldoDe(otroReceptor);

        await confirmarTodos();
        await service.confirmarPrestacion(acuerdo.id, otroReceptor.id);

        expect(await saldoDe(perfilesList[0])).toBe(saldoPrestador + acuerdo.horas);
        expect(await saldoDe(otroReceptor)).toBe(saldoOtro - acuerdo.horas);
    });

    it('confirmarPrestacion should throw an exception for an invalid acuerdo', async () => {
        await expect(() => service.confirmarPrestacion("0", perfilesList[0].id))
            .rejects.toHaveProperty("message", "The acuerdo with the given id was not found");
    });

    it('confirmarPrestacion should throw an exception when the acuerdo is not acordado', async () => {
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "The acuerdo must be acordado to confirm the prestacion");
    });

    it('confirmarPrestacion should throw an exception before the fechaRealizacion', async () => {
        await acuerdoRepository.update(acuerdo.id, { estado: EstadoAcuerdo.ACORDADO, fechaRealizacion: faker.date.future() });
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "The prestacion cannot be confirmed before the fechaRealizacion");
    });

    it('confirmarPrestacion should throw an exception for a perfil that is not a participant', async () => {
        await prepararParaConfirmar();
        const ajeno = await createPerfil();
        await expect(() => service.confirmarPrestacion(acuerdo.id, ajeno.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the acuerdo");
    });

    it('confirmarPrestacion should throw an exception when the perfil already confirmed', async () => {
        await prepararParaConfirmar();
        await service.confirmarPrestacion(acuerdo.id, perfilesList[0].id);
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "The perfil already confirmed the prestacion");
    });

    it('confirmarPrestacion should throw an exception without a RECEPTOR', async () => {
        await service.deleteParticipanteAcuerdo(acuerdo.id, perfilesList[1].id);
        await prepararParaConfirmar();
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "An acuerdo must have at least one PRESTADOR and one RECEPTOR to be realizado");
    });

    it('confirmarPrestacion should throw an exception for a realizado acuerdo', async () => {
        await prepararParaConfirmar();
        await confirmarTodos();
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "The acuerdo is realizado and cannot be modified");
    });

    // --- Saldo de los receptores (RF-043) ---

    it('addParticipanteAcuerdo should throw an exception for a RECEPTOR without enough saldo', async () => {
        const sinSaldo = await createPerfil();
        await perfilRepository.update(sinSaldo.id, { saldo: acuerdo.horas - 1 });
        await expect(() => service.addParticipanteAcuerdo(acuerdo.id, sinSaldo.id, RolParticipante.RECEPTOR))
            .rejects.toHaveProperty("message", "The perfil does not have enough saldo to be a RECEPTOR in the acuerdo");
    });

    it('addParticipanteAcuerdo should let a PRESTADOR without saldo join', async () => {
        const sinSaldo = await createPerfil();
        await perfilRepository.update(sinSaldo.id, { saldo: 0 });
        const result = await service.addParticipanteAcuerdo(acuerdo.id, sinSaldo.id, RolParticipante.PRESTADOR);
        expect(result.participantes.length).toBe(3);
    });

    it('update should throw an exception when a RECEPTOR cannot pay the new horas', async () => {
        await perfilRepository.update(perfilesList[1].id, { saldo: acuerdo.horas });
        const cambios = { ...acuerdo, horas: acuerdo.horas + 1, estado: undefined } as unknown as AcuerdoEntity;
        await expect(() => service.update(acuerdo.id, cambios))
            .rejects.toHaveProperty("message", "The perfil does not have enough saldo to be a RECEPTOR in the acuerdo");
    });

    // --- Estado 4: cancelado ---

    const cancelarDirectamente = async () => {
        await acuerdoRepository.update(acuerdo.id, { estado: EstadoAcuerdo.CANCELADO });
    };

    it('confirmarPrestacion should throw an exception for a cancelado acuerdo', async () => {
        await cancelarDirectamente();
        await expect(() => service.confirmarPrestacion(acuerdo.id, perfilesList[0].id))
            .rejects.toHaveProperty("message", "The acuerdo is cancelado and cannot be modified");
    });

    it('addParticipanteAcuerdo should throw an exception for a cancelado acuerdo', async () => {
        await cancelarDirectamente();
        const newPerfil = await createPerfil();
        await expect(() => service.addParticipanteAcuerdo(acuerdo.id, newPerfil.id, RolParticipante.RECEPTOR))
            .rejects.toHaveProperty("message", "The acuerdo is cancelado and cannot be modified");
    });

    it('addParticipanteAcuerdo should throw an exception for a realizado acuerdo', async () => {
        await prepararParaConfirmar();
        await confirmarTodos();
        const newPerfil = await createPerfil();
        await expect(() => service.addParticipanteAcuerdo(acuerdo.id, newPerfil.id, RolParticipante.RECEPTOR))
            .rejects.toHaveProperty("message", "The acuerdo is realizado and cannot be modified");
    });

    it('update should throw an exception when trying to set estado cancelado', async () => {
        const cambios = { ...acuerdo, estado: EstadoAcuerdo.CANCELADO } as AcuerdoEntity;
        await expect(() => service.update(acuerdo.id, cambios))
            .rejects.toHaveProperty("message", "An acuerdo can only be cancelado through a solicitud de cancelacion");
    });

    it('update should throw an exception for a cancelado acuerdo', async () => {
        await cancelarDirectamente();
        const cambios = { ...acuerdo, horas: 5, estado: undefined } as unknown as AcuerdoEntity;
        await expect(() => service.update(acuerdo.id, cambios))
            .rejects.toHaveProperty("message", "The acuerdo is cancelado and cannot be modified");
    });
});