/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/post-ayuda.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PostAyudaService } from './post-ayuda.service';
import { PostAyudaEntity } from './post-ayuda.entity';
import { PostAyudaCategoriaEntity } from './post-ayuda-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

describe('PostAyudaService', () => {
    let service: PostAyudaService;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let categoriaRepository: Repository<CategoriaEntity>;
    let postCategoriaRepository: Repository<PostAyudaCategoriaEntity>;

    let perfil: PerfilMiembroEntity;
    let categoriasList: CategoriaEntity[];
    let post: PostAyudaEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PostAyudaService],
        }).compile();

        service = module.get<PostAyudaService>(PostAyudaService);
        postAyudaRepository = module.get<Repository<PostAyudaEntity>>(getRepositoryToken(PostAyudaEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        categoriaRepository = module.get<Repository<CategoriaEntity>>(getRepositoryToken(CategoriaEntity));
        postCategoriaRepository = module.get<Repository<PostAyudaCategoriaEntity>>(getRepositoryToken(PostAyudaCategoriaEntity));

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
        await postCategoriaRepository.clear();
        await postAyudaRepository.clear();
        await categoriaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();

        categoriasList = [];
        for (let i = 0; i < 5; i++) {
            categoriasList.push(await categoriaRepository.save({ nombre: faker.commerce.department() }));
        }

        post = await postAyudaRepository.save({
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: true,
            cupo: 2,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        });

        await postCategoriaRepository.save({ idPostAyuda: post.id, idCategoria: categoriasList[0].id });
        await postCategoriaRepository.save({ idPostAyuda: post.id, idCategoria: categoriasList[1].id });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a post ayuda with 1 to 3 categorias', async () => {
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        } as PostAyudaEntity;

        const result = await service.create(nuevoPost, [categoriasList[2].id]);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(1);
    });

    it('create should throw an exception without a perfil autor', async () => {
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
        } as PostAyudaEntity;

        await expect(() => service.create(nuevoPost, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "A post ayuda must have a perfil autor");
    });

    it('create should throw an exception for an invalid perfil autor', async () => {
        const invalidPerfil: PerfilMiembroEntity = { id: "0" } as PerfilMiembroEntity;
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: invalidPerfil,
        } as PostAyudaEntity;

        await expect(() => service.create(nuevoPost, [categoriasList[2].id]))
            .rejects.toHaveProperty("message", "The perfil autor with the given id was not found");
    });

    it('create should throw an exception with no categorias', async () => {
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        } as PostAyudaEntity;

        await expect(() => service.create(nuevoPost, []))
            .rejects.toHaveProperty("message", "A post ayuda must have between 1 and 3 categorias");
    });

    it('create should throw an exception with more than 3 categorias', async () => {
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        } as PostAyudaEntity;

        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.create(nuevoPost, ids))
            .rejects.toHaveProperty("message", "A post ayuda must have between 1 and 3 categorias");
    });

    it('create should throw an exception for an invalid categoria', async () => {
        const nuevoPost: PostAyudaEntity = {
            id: "",
            titulo: faker.lorem.words(3),
            descripcion: faker.lorem.sentence(),
            imagen: faker.image.url(),
            ofrece: false,
            cupo: 1,
            cupoLleno: false,
            fechaCreacion: faker.date.recent(),
            perfilAutor: perfil,
        } as PostAyudaEntity;

        await expect(() => service.create(nuevoPost, ["0"]))
            .rejects.toHaveProperty("message", "The categoria with the given id was not found");
    });

    it('findOne should return a post ayuda by id', async () => {
        const result = await service.findOne(post.id);
        expect(result).not.toBeNull();
        expect(result.categorias.length).toBe(2);
    });

    it('findOne should throw an exception for an invalid post ayuda', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The post ayuda with the given id was not found");
    });

    it('update should modify a post ayuda', async () => {
        post.titulo = faker.lorem.words(3);
        const updated = await service.update(post.id, post);
        expect(updated.titulo).toBe(post.titulo);
    });

    it('update should throw an exception for an invalid post ayuda', async () => {
        const invalidPost = { ...post, titulo: faker.lorem.words(3) };
        await expect(() => service.update("0", invalidPost))
            .rejects.toHaveProperty("message", "The post ayuda with the given id was not found");
    });

    it('findCategoriasByPostId should return the categorias of a post', async () => {
        const categorias = await service.findCategoriasByPostId(post.id);
        expect(categorias.length).toBe(2);
    });

    it('findCategoriasByPostId should throw an exception for an invalid post ayuda', async () => {
        await expect(() => service.findCategoriasByPostId("0"))
            .rejects.toHaveProperty("message", "The post ayuda with the given id was not found");
    });

    it('associateCategoriasPost should update the categorias of a post', async () => {
        const result = await service.associateCategoriasPost(post.id, [categoriasList[3].id]);
        expect(result.categorias.length).toBe(1);
    });

    it('associateCategoriasPost should throw an exception for an invalid post ayuda', async () => {
        await expect(() => service.associateCategoriasPost("0", [categoriasList[3].id]))
            .rejects.toHaveProperty("message", "The post ayuda with the given id was not found");
    });

    it('associateCategoriasPost should throw an exception with more than 3 categorias', async () => {
        const ids = categoriasList.slice(0, 4).map(c => c.id);
        await expect(() => service.associateCategoriasPost(post.id, ids))
            .rejects.toHaveProperty("message", "A post ayuda must have between 1 and 3 categorias");
    });

    it('delete should remove a post ayuda', async () => {
        await service.delete(post.id);
        const deleted = await postAyudaRepository.findOne({ where: { id: post.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid post ayuda', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The post ayuda with the given id was not found");
    });
});