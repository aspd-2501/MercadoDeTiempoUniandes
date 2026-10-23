/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PostComunitarioService } from './post-comunitario.service';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { UsuarioPostEntity } from './usuario-post.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('PostComunitarioService', () => {
    let service: PostComunitarioService;
    let postComunitarioRepository: Repository<PostComunitarioEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioPostRepository: Repository<UsuarioPostEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let post: PostComunitarioEntity;
    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PostComunitarioService],
        }).compile();

        service = module.get<PostComunitarioService>(PostComunitarioService);
        postComunitarioRepository = module.get<Repository<PostComunitarioEntity>>(getRepositoryToken(PostComunitarioEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioPostRepository = module.get<Repository<UsuarioPostEntity>>(getRepositoryToken(UsuarioPostEntity));
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
        await usuarioPostRepository.clear();
        await postComunitarioRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfilesList = [];
        for (let i = 0; i < 3; i++) {
            perfilesList.push(await createPerfil());
        }

        post = await postComunitarioRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            fechaCreacion: faker.date.recent(),
            imagen: faker.image.url(),
            likes: 0,
            creador: perfilesList[0],
        });

        for (const p of perfilesList) {
            await usuarioPostRepository.save({ idPostComunitario: post.id, idPerfil: p.id });
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a post with at least 2 participantes', async () => {
        const p1 = await createPerfil();
        const p2 = await createPerfil();
        const nuevoPost: PostComunitarioEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            fechaCreacion: faker.date.recent(),
            imagen: faker.image.url(),
            likes: 999,
            creador: p1,
        } as PostComunitarioEntity;

        const result = await service.create(nuevoPost, [p1.id, p2.id]);
        expect(result.participantes.length).toBe(2);
        expect(result.likes).toBe(0);
    });

    it('create should throw an exception with fewer than 2 participantes', async () => {
        const p1 = await createPerfil();
        const nuevoPost: PostComunitarioEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            fechaCreacion: faker.date.recent(),
            imagen: faker.image.url(),
            likes: 0,
            creador: p1,
        } as PostComunitarioEntity;

        await expect(() => service.create(nuevoPost, [p1.id]))
            .rejects.toHaveProperty("message", "A post comunitario must have at least 2 participantes");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const p1 = await createPerfil();
        const nuevoPost: PostComunitarioEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            fechaCreacion: faker.date.recent(),
            imagen: faker.image.url(),
            likes: 0,
            creador: p1,
        } as PostComunitarioEntity;

        await expect(() => service.create(nuevoPost, [p1.id, "0"]))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('findOne should return a post by id', async () => {
        const result = await service.findOne(post.id);
        expect(result).not.toBeNull();
        expect(result.participantes.length).toBe(3);
    });

    it('findOne should throw an exception for an invalid post', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('update should modify a post', async () => {
        post.titulo = faker.lorem.words(3);
        const updated = await service.update(post.id, post);
        expect(updated.titulo).toBe(post.titulo);
    });

    it('update should throw an exception for an invalid post', async () => {
        const invalidPost = { ...post, titulo: faker.lorem.words(3) };
        await expect(() => service.update("0", invalidPost))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('addParticipantePost should add a perfil to a post', async () => {
        const nuevoPerfil = await createPerfil();
        const result = await service.addParticipantePost(post.id, nuevoPerfil.id);
        expect(result.participantes.length).toBe(4);
    });

    it('addParticipantePost should throw an exception for an invalid perfil', async () => {
        await expect(() => service.addParticipantePost(post.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('addParticipantePost should throw an exception for an invalid post', async () => {
        const nuevoPerfil = await createPerfil();
        await expect(() => service.addParticipantePost("0", nuevoPerfil.id))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('addParticipantePost should throw an exception for an already participating perfil', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.addParticipantePost(post.id, perfil.id))
            .rejects.toHaveProperty("message", "The perfil is already a participante in the post");
    });

    it('findParticipantesByPostId should return perfiles by post', async () => {
        const perfiles = await service.findParticipantesByPostId(post.id);
        expect(perfiles.length).toBe(3);
    });

    it('findParticipantesByPostId should throw an exception for an invalid post', async () => {
        await expect(() => service.findParticipantesByPostId("0"))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('deleteParticipantePost should remove a perfil from a post', async () => {
        const perfil = perfilesList[0];
        await service.deleteParticipantePost(post.id, perfil.id);

        const stored = await postComunitarioRepository.findOne({ where: { id: post.id }, relations: { participantes: true } });
        expect(stored!.participantes.length).toBe(2);
    });

    it('deleteParticipantePost should throw an exception for an invalid perfil', async () => {
        await expect(() => service.deleteParticipantePost(post.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deleteParticipantePost should throw an exception for an invalid post', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.deleteParticipantePost("0", perfil.id))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });

    it('deleteParticipantePost should throw an exception for a non-participating perfil', async () => {
        const nuevoPerfil = await createPerfil();
        await expect(() => service.deleteParticipantePost(post.id, nuevoPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participante in the post");
    });

    it('deleteParticipantePost should throw an exception when it would leave fewer than 2 participantes', async () => {
        await service.deleteParticipantePost(post.id, perfilesList[0].id);
        await expect(() => service.deleteParticipantePost(post.id, perfilesList[1].id))
            .rejects.toHaveProperty("message", "A post comunitario must keep at least 2 participantes");
    });

    it('delete should remove a post', async () => {
        await service.delete(post.id);
        const deleted = await postComunitarioRepository.findOne({ where: { id: post.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid post', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The post comunitario with the given id was not found");
    });
});