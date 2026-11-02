/* eslint-disable prettier/prettier */
/* archivo: src/feed/feed.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { FeedService } from './feed.service';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PerfilInteresEntity } from '../perfil-miembro/perfil-interes.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PostAyudaCategoriaEntity } from '../post-ayuda/post-ayuda-categoria.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { CausaEntity } from '../causa/causa.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from '../servicio-ofrecido/servicio-ofrecido-categoria.entity';

describe('FeedService', () => {
    let service: FeedService;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let interesRepository: Repository<PerfilInteresEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let postCategoriaRepository: Repository<PostAyudaCategoriaEntity>;
    let postComunitarioRepository: Repository<PostComunitarioEntity>;
    let causaRepository: Repository<CausaEntity>;
    let categoriaRepository: Repository<CategoriaEntity>;

    let lector: PerfilMiembroEntity;     // quien mira el feed; le interesa "Académico"
    let autor: PerfilMiembroEntity;
    let academico: CategoriaEntity;
    let musica: CategoriaEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [FeedService],
        }).compile();

        service = module.get<FeedService>(FeedService);
        perfilRepository = module.get(getRepositoryToken(PerfilMiembroEntity));
        interesRepository = module.get(getRepositoryToken(PerfilInteresEntity));
        usuarioRepository = module.get(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get(getRepositoryToken(PostAyudaEntity));
        postCategoriaRepository = module.get(getRepositoryToken(PostAyudaCategoriaEntity));
        postComunitarioRepository = module.get(getRepositoryToken(PostComunitarioEntity));
        causaRepository = module.get(getRepositoryToken(CausaEntity));
        categoriaRepository = module.get(getRepositoryToken(CategoriaEntity));

        await seedDatabase();
    });

    const createPerfil = async (nombre: string): Promise<PerfilMiembroEntity> => {
        const usuario: UsuarioEntity = await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            contrasenia: faker.internet.password(),
        });
        return await perfilRepository.save({
            imagen: faker.image.url(), descripcion: 'Estudiante', nombre,
            edad: 20, afiliacionUniandes: 'Estudiante', estadoActividad: true, saldo: 10, usuario,
        });
    };

    const fecha = (dia: number) => new Date(Date.UTC(2026, 9, dia));

    const crearPostAyuda = async (titulo: string, dia: number, categoria?: CategoriaEntity, extra: Partial<PostAyudaEntity> = {}) => {
        const post = await postAyudaRepository.save({
            titulo, descripcion: 'Detalle del post', imagen: faker.image.url(), ofrece: true,
            cupo: 1, cupoLleno: false, horas: 2, fechaCreacion: fecha(dia), perfilAutor: autor, ...extra,
        });
        if (categoria)
            await postCategoriaRepository.save({ idPostAyuda: post.id, idCategoria: categoria.id });
        return post;
    };

    const seedDatabase = async () => {
        await interesRepository.clear();
        await postCategoriaRepository.clear();
        await postAyudaRepository.clear();
        await postComunitarioRepository.clear();
        await causaRepository.clear();
        await categoriaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        lector = await createPerfil('Ana');
        autor = await createPerfil('Tomás');
        academico = await categoriaRepository.save({ nombre: 'Académico' });
        musica = await categoriaRepository.save({ nombre: 'Música' });
        await interesRepository.save({ idPerfil: lector.id, idCategoria: academico.id });
    };

    const titulos = async (filtros = {}) =>
        (await service.findFeed({ perfilId: lector.id, ...filtros })).publicaciones.map(p => p.titulo);

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findFeed should mix posts de ayuda, public posts comunitarios and causas', async () => {
        await crearPostAyuda('Clases de guitarra', 3, musica);
        await postComunitarioRepository.save({ titulo: 'Logramos la jornada', descripcion: 'Gracias', imagen: 'i', fechaCreacion: fecha(2), likes: 0, publico: true, aprobaciones: 2, creador: autor });
        await causaRepository.save({ nombre: 'Recolección de libros', descripcion: 'Para la biblioteca', imagen: 'i', perfilCreador: autor, perfilReceptor: autor });

        const result = await service.findFeed({ perfilId: lector.id });
        expect(result.publicaciones.map(p => p.tipo).sort()).toEqual(['CAUSA', 'POST_AYUDA', 'POST_COMUNITARIO']);
    });

    it('findFeed should hide private posts comunitarios, posts with cupo lleno and the miembro own publicaciones', async () => {
        await postComunitarioRepository.save({ titulo: 'Borrador', descripcion: 'd', imagen: 'i', fechaCreacion: fecha(2), likes: 0, publico: false, aprobaciones: 0, creador: autor });
        await crearPostAyuda('Sin cupo', 4, undefined, { cupoLleno: true });
        await crearPostAyuda('Mi propio post', 5, undefined, { perfilAutor: lector });
        await crearPostAyuda('Visible', 6);

        expect(await titulos()).toEqual(['Visible']);
    });

    it('findFeed should show first the publicaciones that match the intereses of the miembro (RF-021)', async () => {
        await crearPostAyuda('Guitarra nueva', 9, musica);
        await crearPostAyuda('Tutoría de cálculo', 1, academico);
        await crearPostAyuda('Sin categoría', 5);

        const result = await service.findFeed({ perfilId: lector.id });
        expect(result.publicaciones.map(p => p.titulo)).toEqual(['Tutoría de cálculo', 'Guitarra nueva', 'Sin categoría']);
        expect(result.publicaciones[0].relevante).toBe(true);
        expect(result.publicaciones[1].relevante).toBe(false);
    });

    it('findFeed should also use the categorias of the servicios the miembro offers', async () => {
        const otroLector = await createPerfil('Sofía');
        const servicio = await perfilRepository.manager.getRepository(ServicioOfrecidoEntity)
            .save({ titulo: 'Clases de piano', descripcion: 'd', visible: true, perfil: otroLector });
        await perfilRepository.manager.getRepository(ServicioOfrecidoCategoriaEntity)
            .save({ idServicio: servicio.id, idCategoria: musica.id });
        await crearPostAyuda('Guitarra', 1, musica);
        await crearPostAyuda('Otro más nuevo', 9);

        const result = await service.findFeed({ perfilId: otroLector.id });
        expect(result.publicaciones[0].titulo).toBe('Guitarra');
        expect(result.publicaciones[0].relevante).toBe(true);
    });

    it('findFeed should order by fecha, newest first, when nothing is relevante', async () => {
        await crearPostAyuda('Viejo', 1);
        await crearPostAyuda('Nuevo', 9);
        await crearPostAyuda('Medio', 5);
        expect(await titulos()).toEqual(['Nuevo', 'Medio', 'Viejo']);
    });

    it('findFeed should filter by categoria ignoring tildes and mayúsculas', async () => {
        await crearPostAyuda('Tutoría', 1, academico);
        await crearPostAyuda('Guitarra', 2, musica);
        expect(await titulos({ categoria: 'academico' })).toEqual(['Tutoría']);
    });

    it('findFeed should filter by palabras clave, including the nombre of the autor', async () => {
        await crearPostAyuda('Ayuda con Excel', 1);
        await crearPostAyuda('Guitarra', 2);
        expect(await titulos({ q: 'excel' })).toEqual(['Ayuda con Excel']);
        expect((await titulos({ q: 'tomas' })).length).toBe(2);
    });

    it('findFeed should paginate and tell if there are more publicaciones (RF-020)', async () => {
        for (let dia = 1; dia <= 5; dia++)
            await crearPostAyuda(`Post ${dia}`, dia);

        const primera = await service.findFeed({ perfilId: lector.id, pagina: 1, tamano: 2 });
        expect(primera.publicaciones.map(p => p.titulo)).toEqual(['Post 5', 'Post 4']);
        expect(primera.hayMas).toBe(true);

        const ultima = await service.findFeed({ perfilId: lector.id, pagina: 3, tamano: 2 });
        expect(ultima.publicaciones.map(p => p.titulo)).toEqual(['Post 1']);
        expect(ultima.hayMas).toBe(false);
    });

    it('findFeed should work without a perfil', async () => {
        await crearPostAyuda('Público', 1, academico);
        const result = await service.findFeed({});
        expect(result.publicaciones.length).toBe(1);
        expect(result.publicaciones[0].relevante).toBe(false);
    });

    it('findFeed should throw an exception for an invalid pagina or tamano', async () => {
        await expect(() => service.findFeed({ pagina: 0 }))
            .rejects.toHaveProperty("message", "The pagina must be an integer greater than 0");
        await expect(() => service.findFeed({ tamano: 51 }))
            .rejects.toHaveProperty("message", "The tamano must be an integer between 1 and 50");
    });

    it('findFeed should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findFeed({ perfilId: "0" }))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });
});
