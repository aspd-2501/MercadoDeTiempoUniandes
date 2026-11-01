/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/busqueda.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { BusquedaService, TipoPostBusqueda } from './busqueda.service';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PostAyudaCategoriaEntity } from '../post-ayuda/post-ayuda-categoria.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from '../servicio-ofrecido/servicio-ofrecido-categoria.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

describe('BusquedaService', () => {
    let service: BusquedaService;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postAyudaRepository: Repository<PostAyudaEntity>;
    let postCategoriaRepository: Repository<PostAyudaCategoriaEntity>;
    let servicioRepository: Repository<ServicioOfrecidoEntity>;
    let servicioCategoriaRepository: Repository<ServicioOfrecidoCategoriaEntity>;
    let categoriaRepository: Repository<CategoriaEntity>;

    let ana: PerfilMiembroEntity;      // ofrece "Tutoría de cálculo" (visible)
    let tomas: PerfilMiembroEntity;    // ofrece "Fotografía de eventos" (oculto)
    let sofia: PerfilMiembroEntity;    // Administración, sin servicios
    let musica: CategoriaEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [BusquedaService],
        }).compile();

        service = module.get<BusquedaService>(BusquedaService);
        perfilRepository = module.get(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get(getRepositoryToken(UsuarioEntity));
        postAyudaRepository = module.get(getRepositoryToken(PostAyudaEntity));
        postCategoriaRepository = module.get(getRepositoryToken(PostAyudaCategoriaEntity));
        servicioRepository = module.get(getRepositoryToken(ServicioOfrecidoEntity));
        servicioCategoriaRepository = module.get(getRepositoryToken(ServicioOfrecidoCategoriaEntity));
        categoriaRepository = module.get(getRepositoryToken(CategoriaEntity));

        await seedDatabase();
    });

    const createPerfil = async (nombre: string, afiliacionUniandes: string, descripcion = 'Estudiante de la universidad'): Promise<PerfilMiembroEntity> => {
        const usuario: UsuarioEntity = await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            contrasenia: faker.internet.password(),
        });
        return await perfilRepository.save({
            imagen: faker.image.url(), descripcion, nombre,
            edad: 20, afiliacionUniandes, estadoActividad: true, saldo: 10, usuario,
        });
    };

    const crearPost = async (titulo: string, ofrece: boolean, autor: PerfilMiembroEntity, dia: number) =>
        await postAyudaRepository.save({
            titulo, descripcion: 'Busco o doy apoyo', imagen: faker.image.url(), ofrece,
            cupo: 1, cupoLleno: false, horas: 2, fechaCreacion: new Date(Date.UTC(2026, 9, dia)), perfilAutor: autor,
        });

    const seedDatabase = async () => {
        await servicioCategoriaRepository.clear();
        await postCategoriaRepository.clear();
        await servicioRepository.clear();
        await postAyudaRepository.clear();
        await categoriaRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        ana = await createPerfil('Ana Martínez', 'Matemáticas');
        tomas = await createPerfil('Tomás Bedoya', 'Diseño');
        sofia = await createPerfil('Sofía Padilla', 'Administración', 'Me gusta la guitarra');
        musica = await categoriaRepository.save({ nombre: 'Música' });

        await servicioRepository.save({ titulo: 'Tutoría de cálculo', descripcion: 'Derivadas e integrales', visible: true, perfil: ana });
        await servicioRepository.save({ titulo: 'Fotografía de eventos', descripcion: 'Fotos profesionales', visible: false, perfil: tomas });

        await crearPost('Necesito ayuda con Excel', false, sofia, 1);
        await crearPost('Ofrezco clases de inglés', true, ana, 3);
        const conCategoria = await crearPost('Clases de guitarra', true, tomas, 2);
        await postCategoriaRepository.save({ idPostAyuda: conCategoria.id, idCategoria: musica.id });
    };

    // --- Miembros (RF-023, RF-024) ---

    it('buscarMiembros should find miembros by nombre ignoring tildes', async () => {
        const result = await service.buscarMiembros('tomas');
        expect(result.map(p => p.nombre)).toEqual(['Tomás Bedoya']);
    });

    it('buscarMiembros should find miembros by the servicios they offer', async () => {
        const result = await service.buscarMiembros('calculo');
        expect(result.map(p => p.nombre)).toEqual(['Ana Martínez']);
    });

    it('buscarMiembros should ignore the servicios that are not visible', async () => {
        const result = await service.buscarMiembros('fotografia');
        expect(result.length).toBe(0);

        const [tomasEncontrado] = await service.buscarMiembros('tomas');
        expect(tomasEncontrado.serviciosOfrecidos.length).toBe(0);
    });

    it('buscarMiembros should find miembros by descripcion or afiliacion', async () => {
        expect((await service.buscarMiembros('guitarra')).map(p => p.nombre)).toEqual(['Sofía Padilla']);
        expect((await service.buscarMiembros('diseno')).map(p => p.nombre)).toEqual(['Tomás Bedoya']);
    });

    it('buscarMiembros should return everyone sorted by nombre and exclude the given perfil', async () => {
        const result = await service.buscarMiembros('', ana.id);
        expect(result.map(p => p.nombre)).toEqual(['Sofía Padilla', 'Tomás Bedoya']);
    });

    // --- Posts de ayuda (RF-025) ---

    it('buscarPostsAyuda should filter by palabra clave and return the newest first', async () => {
        const result = await service.buscarPostsAyuda('clases');
        expect(result.map(p => p.titulo)).toEqual(['Ofrezco clases de inglés', 'Clases de guitarra']);
    });

    it('buscarPostsAyuda should find posts by categoria', async () => {
        const result = await service.buscarPostsAyuda('musica');
        expect(result.map(p => p.titulo)).toEqual(['Clases de guitarra']);
    });

    it('buscarPostsAyuda should filter solicitudes and ofrecimientos', async () => {
        expect((await service.buscarPostsAyuda('', TipoPostBusqueda.SOLICITUD)).map(p => p.titulo))
            .toEqual(['Necesito ayuda con Excel']);
        expect((await service.buscarPostsAyuda('', TipoPostBusqueda.OFRECIMIENTO)).length).toBe(2);
    });

    it('buscarPostsAyuda should return an empty list when nothing matches', async () => {
        expect((await service.buscarPostsAyuda('astronomia')).length).toBe(0);
    });

    // --- Servicios ---

    it('buscarServicios should return only visible servicios that match', async () => {
        expect((await service.buscarServicios('')).map(s => s.titulo)).toEqual(['Tutoría de cálculo']);
        expect((await service.buscarServicios('fotografia')).length).toBe(0);
        expect((await service.buscarServicios('integrales')).length).toBe(1);
    });
});
