/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';

describe('AcuerdoService', () => {
    let service: AcuerdoService;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;

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
            fechaCreacion: faker.date.recent(),
            perfilAutor: autor,
        });

        acuerdo = await acuerdoRepository.save({
            horas: faker.number.int({ min: 1, max: 10 }),
            fechaCreacion: faker.date.recent(),
            fechaRealizacion: faker.date.future(),
            finalizado: false,
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
});