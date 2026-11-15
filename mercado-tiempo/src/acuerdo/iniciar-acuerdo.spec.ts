/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/iniciar-acuerdo.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AcuerdoService } from './acuerdo.service';
import { AcuerdoEntity } from './acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ChatEntity } from '../chat/chat.entity';
import { ChatParticipanteEntity } from '../chat/chat-participante.entity';
import { PerfilOrganizacionEntity } from '../perfil-organizacion/perfil-organizacion.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';

describe('AcuerdoService.iniciar (acuerdo, participantes y chat en una sola operación)', () => {
    let service: AcuerdoService;
    let acuerdoRepository: Repository<AcuerdoEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let participanteRepository: Repository<ParticipanteAcuerdoEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let postRepository: Repository<PostAyudaEntity>;
    let chatRepository: Repository<ChatEntity>;
    let chatParticipanteRepository: Repository<ChatParticipanteEntity>;
    let organizacionRepository: Repository<PerfilOrganizacionEntity>;
    let solicitudRepository: Repository<SolicitudAyudaEntity>;

    let autor: PerfilMiembroEntity;
    let miembro: PerfilMiembroEntity;
    let postOfrece: PostAyudaEntity;
    let postPide: PostAyudaEntity;
    const fecha = new Date(Date.UTC(2026, 11, 5, 15));

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [AcuerdoService],
        }).compile();

        service = module.get(AcuerdoService);
        acuerdoRepository = module.get(getRepositoryToken(AcuerdoEntity));
        perfilRepository = module.get(getRepositoryToken(PerfilMiembroEntity));
        participanteRepository = module.get(getRepositoryToken(ParticipanteAcuerdoEntity));
        usuarioRepository = module.get(getRepositoryToken(UsuarioEntity));
        postRepository = module.get(getRepositoryToken(PostAyudaEntity));
        chatRepository = module.get(getRepositoryToken(ChatEntity));
        chatParticipanteRepository = module.get(getRepositoryToken(ChatParticipanteEntity));
        organizacionRepository = module.get(getRepositoryToken(PerfilOrganizacionEntity));
        solicitudRepository = module.get(getRepositoryToken(SolicitudAyudaEntity));

        autor = await crearPerfil(10);
        miembro = await crearPerfil(10);
        postOfrece = await crearPost(true, 2);
        postPide = await crearPost(false, 3);
    });

    const crearPerfil = async (saldo: number): Promise<PerfilMiembroEntity> => {
        const usuario = await usuarioRepository.save({ idUniandes: faker.string.alphanumeric(10), contrasenia: 'clave123' });
        return await perfilRepository.save({
            imagen: faker.image.url(), descripcion: faker.lorem.sentence(), nombre: faker.person.fullName(),
            edad: 20, afiliacionUniandes: 'Estudiante', estadoActividad: true, saldo, usuario,
        });
    };

    const crearPost = async (ofrece: boolean, horas: number, cupoLleno = false): Promise<PostAyudaEntity> =>
        await postRepository.save({
            titulo: faker.lorem.words(3), descripcion: faker.lorem.sentence(), imagen: faker.image.url(),
            ofrece, cupo: 2, cupoLleno, horas, fechaCreacion: new Date(), perfilAutor: autor,
        });

    const nadaCreado = async () => {
        expect(await acuerdoRepository.count()).toBe(0);
        expect(await participanteRepository.count()).toBe(0);
        expect(await chatRepository.count()).toBe(0);
        expect(await chatParticipanteRepository.count()).toBe(0);
    };

    const rolDe = (acuerdo: AcuerdoEntity, perfil: PerfilMiembroEntity) => acuerdo.participantes.find(p => p.idPerfil === perfil.id)?.rol;

    it('should create the acuerdo, both participantes and the chat from a post that ofrece ayuda', async () => {
        const acuerdo = await service.iniciar({ postAyudaId: postOfrece.id, perfilId: miembro.id, fechaRealizacion: fecha });

        expect(acuerdo.estado).toBe(EstadoAcuerdo.EN_CREACION);
        expect(acuerdo.horas).toBe(2);
        expect(acuerdo.postAyuda.id).toBe(postOfrece.id);
        expect(new Date(acuerdo.fechaRealizacion).getTime()).toBe(fecha.getTime());
        expect(acuerdo.participantes).toHaveLength(2);
        expect(rolDe(acuerdo, autor)).toBe(RolParticipante.PRESTADOR);
        expect(rolDe(acuerdo, miembro)).toBe(RolParticipante.RECEPTOR);

        expect(acuerdo.chat).toBeTruthy();
        const enChat = await chatParticipanteRepository.find({ where: { idChat: acuerdo.chat!.id } });
        expect(enChat.map(p => p.idPerfil).sort()).toEqual([autor.id, miembro.id].sort());
    });

    it('should make the author RECEPTOR when the post pide ayuda', async () => {
        const acuerdo = await service.iniciar({ postAyudaId: postPide.id, perfilId: miembro.id, fechaRealizacion: fecha });
        expect(rolDe(acuerdo, autor)).toBe(RolParticipante.RECEPTOR);
        expect(rolDe(acuerdo, miembro)).toBe(RolParticipante.PRESTADOR);
        expect(acuerdo.horas).toBe(3);
    });

    it('should use the horas sent instead of the horas of the post', async () => {
        const acuerdo = await service.iniciar({ postAyudaId: postOfrece.id, perfilId: miembro.id, fechaRealizacion: fecha, horas: 4 });
        expect(acuerdo.horas).toBe(4);
    });

    it('should create nothing when the receptor does not have enough saldo', async () => {
        await perfilRepository.update(miembro.id, { saldo: 1 });
        await expect(() => service.iniciar({ postAyudaId: postOfrece.id, perfilId: miembro.id, fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'Un receptor no tiene saldo suficiente para pagar su parte del acuerdo');
        await nadaCreado();
    });

    it('should create nothing when a step fails after the acuerdo was saved (rollback)', async () => {
        // Simula un fallo al guardar los participantes, cuando el chat y el acuerdo ya se guardaron dentro de la transacción
        const manager = acuerdoRepository.manager;
        const original = manager.transaction.bind(manager) as (fn: (m: EntityManager) => Promise<unknown>) => Promise<unknown>;
        (manager as any).transaction = (fn: (m: EntityManager) => Promise<unknown>) => original(async (m: EntityManager) => {
            const guardar = m.save.bind(m);
            (m as any).save = (objetivo: unknown, ...resto: unknown[]) => {
                if (objetivo === ParticipanteAcuerdoEntity) throw new Error('fallo simulado');
                return (guardar as any)(objetivo, ...resto);
            };
            return fn(m);
        });
        try {
            await expect(() => service.iniciar({ postAyudaId: postOfrece.id, perfilId: miembro.id, fechaRealizacion: fecha }))
                .rejects.toHaveProperty('message', 'fallo simulado');
        } finally {
            (manager as any).transaction = original;
        }
        await nadaCreado();
    });

    it('should reject joining your own post', async () => {
        await expect(() => service.iniciar({ postAyudaId: postOfrece.id, perfilId: autor.id, fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'No puedes unirte a tu propio post');
        await nadaCreado();
    });

    it('should reject a post with cupo lleno', async () => {
        const lleno = await crearPost(true, 2, true);
        await expect(() => service.iniciar({ postAyudaId: lleno.id, perfilId: miembro.id, fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'El post de ayuda ya no tiene cupos');
    });

    it('should require the perfil that joins the post', async () => {
        await expect(() => service.iniciar({ postAyudaId: postOfrece.id, fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'Debes indicar el perfil que se une al post');
    });

    it('should throw for an invalid post or perfil', async () => {
        await expect(() => service.iniciar({ postAyudaId: '0', perfilId: miembro.id, fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'No se encontró el post de ayuda');
        await expect(() => service.iniciar({ postAyudaId: postOfrece.id, perfilId: '0', fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'No se encontró el perfil');
        await nadaCreado();
    });

    it('should require exactly one origen', async () => {
        await expect(() => service.iniciar({ fechaRealizacion: fecha }))
            .rejects.toHaveProperty('message', 'Un acuerdo debe venir de un post de ayuda o de una solicitud, pero no de ambos');
    });

    describe('from a solicitud to an organizacion', () => {
        let organizacion: PerfilMiembroEntity;
        let solicitud: SolicitudAyudaEntity;

        beforeEach(async () => {
            organizacion = await crearPerfil(0);
            const perfilOrg = await organizacionRepository.save({ numMiembros: 3, perfil: organizacion });
            solicitud = await solicitudRepository.save({
                titulo: 'Asesoría', descripcion: 'Hoja de vida', aceptada: true, fechaCreacion: new Date(), horas: 2,
                perfilAutor: miembro, prestador: perfilOrg,
            });
        });

        it('should make the organizacion PRESTADOR and the author RECEPTOR', async () => {
            const acuerdo = await service.iniciar({ solicitudId: solicitud.id, fechaRealizacion: fecha });
            expect(acuerdo.solicitud.id).toBe(solicitud.id);
            expect(acuerdo.horas).toBe(2);
            expect(rolDe(acuerdo, organizacion)).toBe(RolParticipante.PRESTADOR);
            expect(rolDe(acuerdo, miembro)).toBe(RolParticipante.RECEPTOR);
            expect(await chatParticipanteRepository.count({ where: { idChat: acuerdo.chat!.id } })).toBe(2);
        });

        it('should reject a solicitud that already has an acuerdo', async () => {
            await service.iniciar({ solicitudId: solicitud.id, fechaRealizacion: fecha });
            await expect(() => service.iniciar({ solicitudId: solicitud.id, fechaRealizacion: fecha }))
                .rejects.toHaveProperty('message', 'La solicitud ya tiene un acuerdo');
            expect(await acuerdoRepository.count()).toBe(1);
            expect(await chatRepository.count()).toBe(1);
        });
    });
});
