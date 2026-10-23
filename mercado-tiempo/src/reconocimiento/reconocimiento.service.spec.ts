/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ReconocimientoService } from './reconocimiento.service';
import { ReconocimientoEntity } from './reconocimiento.entity';
import { ReconocimientoOtorgadoEntity } from './reconocimiento-otorgado.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { UsuarioPostEntity } from '../post-comunitario/usuario-post.entity';

describe('ReconocimientoService', () => {
    let service: ReconocimientoService;
    let reconocimientoRepository: Repository<ReconocimientoEntity>;
    let otorgadoRepository: Repository<ReconocimientoOtorgadoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postRepository: Repository<PostComunitarioEntity>;
    let usuarioPostRepository: Repository<UsuarioPostEntity>;

    let reconocimiento: ReconocimientoEntity;
    let perfilA: PerfilMiembroEntity;
    let perfilB: PerfilMiembroEntity;
    let perfilAjeno: PerfilMiembroEntity;
    let post: PostComunitarioEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ReconocimientoService],
        }).compile();

        service = module.get<ReconocimientoService>(ReconocimientoService);
        reconocimientoRepository = module.get<Repository<ReconocimientoEntity>>(getRepositoryToken(ReconocimientoEntity));
        otorgadoRepository = module.get<Repository<ReconocimientoOtorgadoEntity>>(getRepositoryToken(ReconocimientoOtorgadoEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        postRepository = module.get<Repository<PostComunitarioEntity>>(getRepositoryToken(PostComunitarioEntity));
        usuarioPostRepository = module.get<Repository<UsuarioPostEntity>>(getRepositoryToken(UsuarioPostEntity));

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
        await otorgadoRepository.clear();
        await usuarioPostRepository.clear();
        await postRepository.clear();
        await reconocimientoRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        reconocimiento = await reconocimientoRepository.save({
            nombre: faker.lorem.words(2),
            descripcion: faker.lorem.sentence(),
            requerimiento: faker.lorem.sentence(),
            icono: faker.image.url(),
        });

        perfilA = await createPerfil();
        perfilB = await createPerfil();
        perfilAjeno = await createPerfil();

        post = await postRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            fechaCreacion: faker.date.recent(),
            imagen: faker.image.url(),
            likes: 0,
        });
        await usuarioPostRepository.save({ idPostComunitario: post.id, idPerfil: perfilA.id });
        await usuarioPostRepository.save({ idPostComunitario: post.id, idPerfil: perfilB.id });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all reconocimientos', async () => {
        const reconocimientos = await service.findAll();
        expect(reconocimientos.length).toBe(1);
    });

    it('findOne should return a reconocimiento by id', async () => {
        const result = await service.findOne(reconocimiento.id);
        expect(result).not.toBeNull();
        expect(result.nombre).toBe(reconocimiento.nombre);
    });

    it('findOne should throw an exception for an invalid reconocimiento', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The reconocimiento with the given id was not found");
    });

    it('create should return a new reconocimiento', async () => {
        const nuevo: ReconocimientoEntity = {
            id: "",
            nombre: faker.lorem.words(2),
            descripcion: faker.lorem.sentence(),
            requerimiento: faker.lorem.sentence(),
            icono: faker.image.url(),
        } as ReconocimientoEntity;

        const result = await service.create(nuevo);
        expect(result).not.toBeNull();
    });

    it('update should modify a reconocimiento', async () => {
        reconocimiento.nombre = faker.lorem.words(2);
        const updated = await service.update(reconocimiento.id, reconocimiento);
        expect(updated.nombre).toBe(reconocimiento.nombre);
    });

    it('update should throw an exception for an invalid reconocimiento', async () => {
        const invalido = { ...reconocimiento, nombre: faker.lorem.words(2) };
        await expect(() => service.update("0", invalido))
            .rejects.toHaveProperty("message", "The reconocimiento with the given id was not found");
    });

    it('delete should remove a reconocimiento', async () => {
        await service.delete(reconocimiento.id);
        const deleted = await reconocimientoRepository.findOne({ where: { id: reconocimiento.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid reconocimiento', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The reconocimiento with the given id was not found");
    });

    it('otorgarReconocimiento should save a reconocimiento without otorgante nor post', async () => {
        const result = await service.otorgarReconocimiento(reconocimiento.id, perfilAjeno.id);
        expect(result).not.toBeNull();
        expect(result.perfilReceptor.id).toBe(perfilAjeno.id);
        expect(result.perfilOtorgante).toBeFalsy();
        expect(result.postComunitario).toBeFalsy();
    });

    it('otorgarReconocimiento should save a reconocimiento within a post comunitario', async () => {
        const result = await service.otorgarReconocimiento(reconocimiento.id, perfilB.id, perfilA.id, post.id);
        expect(result).not.toBeNull();
        expect(result.perfilOtorgante.id).toBe(perfilA.id);
        expect(result.postComunitario.id).toBe(post.id);
    });

    it('otorgarReconocimiento should throw an exception for an invalid reconocimiento', async () => {
        await expect(() => service.otorgarReconocimiento("0", perfilA.id))
            .rejects.toHaveProperty("message", "The reconocimiento with the given id was not found");
    });

    it('otorgarReconocimiento should throw an exception for an invalid perfil receptor', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, "0"))
            .rejects.toHaveProperty("message", "The perfil receptor with the given id was not found");
    });

    it('otorgarReconocimiento should throw an exception when otorgante equals receptor', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilA.id, perfilA.id))
            .rejects.toHaveProperty("message", "A perfil cannot otorgar a reconocimiento to itself");
    });

    it('otorgarReconocimiento should throw an exception for an invalid perfil otorgante', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilA.id, "0"))
            .rejects.toHaveProperty("message", "The perfil otorgante with the given id was not found");
    });

    it('otorgarReconocimiento should throw an exception for a post without otorgante', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilA.id, undefined, post.id))
            .rejects.toHaveProperty("message", "A reconocimiento tied to a post comunitario requires a perfil otorgante");
    });

    it('otorgarReconocimiento should throw an exception for an invalid post comunitario', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilB.id, perfilA.id, "0"))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('otorgarReconocimiento should throw an exception when receptor is not a participante of the post', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilAjeno.id, perfilA.id, post.id))
            .rejects.toHaveProperty("message", "The perfil receptor must be a participante of the post comunitario");
    });

    it('otorgarReconocimiento should throw an exception when otorgante is not a participante of the post', async () => {
        await expect(() => service.otorgarReconocimiento(reconocimiento.id, perfilB.id, perfilAjeno.id, post.id))
            .rejects.toHaveProperty("message", "The perfil otorgante must be a participante of the post comunitario");
    });

    it('findOtorgamientosByPerfilReceptorId should return otorgamientos for a perfil', async () => {
        await service.otorgarReconocimiento(reconocimiento.id, perfilAjeno.id);
        const result = await service.findOtorgamientosByPerfilReceptorId(perfilAjeno.id);
        expect(result.length).toBe(1);
    });

    it('findOtorgamientosByPerfilReceptorId should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findOtorgamientosByPerfilReceptorId("0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });
});