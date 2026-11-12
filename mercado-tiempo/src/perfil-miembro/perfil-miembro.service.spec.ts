/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { PerfilMiembroService, SALDO_INICIAL } from './perfil-miembro.service';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

describe('PerfilMiembroService', () => {
    let service: PerfilMiembroService;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let moderadorRepository: Repository<ModeradorEntity>;
    let transaccionRepository: Repository<TransaccionEntity>;

    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [PerfilMiembroService],
        }).compile();

        service = module.get<PerfilMiembroService>(PerfilMiembroService);
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        moderadorRepository = module.get(getRepositoryToken(ModeradorEntity));
        transaccionRepository = module.get(getRepositoryToken(TransaccionEntity));

        await seedDatabase();
    });

    const createUsuario = async (): Promise<UsuarioEntity> => {
        return await usuarioRepository.save({
            idUniandes: faker.string.alphanumeric(10),
            contrasenia: faker.internet.password(),
        });
    };

    const seedDatabase = async () => {
        await transaccionRepository.clear();
        await moderadorRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfilesList = [];
        for (let i = 0; i < 5; i++) {
            const usuario = await createUsuario();
            const perfil: PerfilMiembroEntity = await perfilRepository.save({
                imagen: faker.image.url(),
                descripcion: faker.lorem.sentence(),
                nombre: faker.person.fullName(),
                edad: faker.number.int({ min: 18, max: 60 }),
                afiliacionUniandes: "Estudiante",
                estadoActividad: true,
                saldo: faker.number.int({ min: 0, max: 100 }),
                usuario,
            });
            perfilesList.push(perfil);
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all perfiles', async () => {
        const perfiles: PerfilMiembroEntity[] = await service.findAll();
        expect(perfiles.length).toBe(perfilesList.length);
    });

    it('findOne should return a perfil by id', async () => {
        const stored: PerfilMiembroEntity = perfilesList[0];
        const perfil: PerfilMiembroEntity = await service.findOne(stored.id);
        expect(perfil).not.toBeNull();
        expect(perfil.descripcion).toBe(stored.descripcion);
        expect(perfil.usuario).not.toBeNull();
    });

    it('findOne should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    it('create should return a new perfil with its usuario', async () => {
        const usuario = await createUsuario();
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre: faker.person.fullName(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: faker.number.int({ min: 0, max: 100 }),
            usuario,
        } as PerfilMiembroEntity;

        const newPerfil: PerfilMiembroEntity = await service.create(perfil);
        expect(newPerfil).not.toBeNull();

        const stored: PerfilMiembroEntity | null = await perfilRepository.findOne({
            where: { id: newPerfil.id },
            relations: { usuario: true }
        });
        expect(stored).not.toBeNull();
        expect(stored!.usuario.id).toBe(usuario.id);
    });

    it('create should throw an exception without a usuario', async () => {
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre: faker.person.fullName(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: 0,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "A perfil miembro must have a usuario");
    });

    it('create should throw an exception for an invalid usuario', async () => {
        const invalidUsuario: UsuarioEntity = { id: "0" } as UsuarioEntity;
        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre: faker.person.fullName(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: 0,
            usuario: invalidUsuario,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });

    it('create should throw an exception when usuario already has a perfil', async () => {
        const perfilExistente = perfilesList[0];
        const usuarioOcupado = await usuarioRepository.findOne({
            where: { id: perfilExistente.usuario.id }
        });

        const perfil: PerfilMiembroEntity = {
            id: "",
            imagen: faker.image.url(),
            descripcion: faker.lorem.sentence(),
            nombre: faker.person.fullName(),
            edad: faker.number.int({ min: 18, max: 60 }),
            afiliacionUniandes: "Estudiante",
            estadoActividad: true,
            saldo: 0,
            usuario: usuarioOcupado,
        } as PerfilMiembroEntity;

        await expect(() => service.create(perfil))
            .rejects.toHaveProperty("message", "The usuario already has a perfil miembro");
    });

    it('update should modify a perfil', async () => {
        const perfil: PerfilMiembroEntity = perfilesList[0];
        perfil.descripcion = faker.lorem.sentence();
        const updated: PerfilMiembroEntity = await service.update(perfil.id, perfil);
        expect(updated).not.toBeNull();
        expect(updated.descripcion).toBe(perfil.descripcion);
    });

    it('update should throw an exception for an invalid perfil', async () => {
        let perfil: PerfilMiembroEntity = perfilesList[0];
        perfil = { ...perfil, descripcion: faker.lorem.sentence() };
        await expect(() => service.update("0", perfil))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    it('delete should remove a perfil', async () => {
        const perfil: PerfilMiembroEntity = perfilesList[0];
        await service.delete(perfil.id);

        const deleted: PerfilMiembroEntity | null = await perfilRepository.findOne({ where: { id: perfil.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid perfil', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    // --- Estado de actividad (RF-006) ---

    it('cambiarEstadoActividad should deactivate and reactivate a perfil', async () => {
        const perfil = perfilesList[0];
        expect((await service.cambiarEstadoActividad(perfil.id, false)).estadoActividad).toBe(false);
        expect((await service.cambiarEstadoActividad(perfil.id, true)).estadoActividad).toBe(true);
    });

    it('cambiarEstadoActividad should throw an exception for an invalid perfil', async () => {
        await expect(() => service.cambiarEstadoActividad("0", false))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });

    // --- Perfil a partir del usuario (inicio de sesión) ---

    it('findByUsuarioId should return the perfil of the usuario', async () => {
        const perfil = perfilesList[0];
        const result = await service.findByUsuarioId(perfil.usuario.id);
        expect(result.id).toBe(perfil.id);
        expect(result.nombre).toBe(perfil.nombre);
    });

    it('findByUsuarioId should throw an exception for a usuario without perfil', async () => {
        const usuarioSinPerfil = await createUsuario();
        await expect(() => service.findByUsuarioId(usuarioSinPerfil.id))
            .rejects.toHaveProperty("message", "The usuario with the given id does not have a perfil miembro");
    });

    // --- Saldo (inicial de 3 horas y solo lo cambia un moderador) ---

    const nuevoPerfil = (usuario: UsuarioEntity, saldo?: number): PerfilMiembroEntity => ({
        imagen: faker.image.url(), descripcion: faker.lorem.sentence(), nombre: faker.person.fullName(),
        edad: 20, afiliacionUniandes: "Estudiante", estadoActividad: true, saldo, usuario,
    }) as PerfilMiembroEntity;

    it('create should start every perfil with SALDO_INICIAL (3) horas', async () => {
        expect(SALDO_INICIAL).toBe(3);
        const sinSaldo = await service.create(nuevoPerfil(await createUsuario()));
        expect(sinSaldo.saldo).toBe(3);
    });

    it('create should ignore the saldo sent by the client', async () => {
        const creado = await service.create(nuevoPerfil(await createUsuario(), 500));
        expect(creado.saldo).toBe(3);
        expect((await perfilRepository.findOneBy({ id: creado.id }))!.saldo).toBe(3);
    });

    it('update should not change the saldo', async () => {
        const original = perfilesList[0];
        const cambio = { ...original, descripcion: 'Nueva descripción', saldo: original.saldo + 50 } as PerfilMiembroEntity;
        const updated = await service.update(original.id, cambio);
        expect(updated.saldo).toBe(original.saldo);
        expect((await perfilRepository.findOneBy({ id: original.id }))!.saldo).toBe(original.saldo);
        expect(updated.descripcion).toBe('Nueva descripción');
    });

    const crearModerador = async (): Promise<UsuarioEntity> => {
        const usuario = await createUsuario();
        await moderadorRepository.save({ usuario });
        return usuario;
    };

    it('ajustarSaldo should let a moderador set the saldo and record a Transaccion', async () => {
        const moderador = await crearModerador();
        const perfil = perfilesList[0];
        await perfilRepository.update(perfil.id, { saldo: 3 });

        const result = await service.ajustarSaldo(perfil.id, 20, moderador.id);
        expect(result.saldo).toBe(20);
        expect((await perfilRepository.findOneBy({ id: perfil.id }))!.saldo).toBe(20);

        await service.ajustarSaldo(perfil.id, 5, moderador.id);
        const movimientos = await transaccionRepository.find({ where: { perfil: { id: perfil.id } }, order: { saldoResultante: 'DESC' } });
        expect(movimientos.map(t => [t.tipo, t.horas, t.saldoResultante])).toEqual([
            [TipoTransaccion.AJUSTE_MODERADOR, 17, 20],
            [TipoTransaccion.AJUSTE_MODERADOR, -15, 5],
        ]);
    });

    it('ajustarSaldo should not record a Transaccion when the saldo does not change', async () => {
        const moderador = await crearModerador();
        const perfil = perfilesList[1];
        await service.ajustarSaldo(perfil.id, perfil.saldo, moderador.id);
        expect(await transaccionRepository.count()).toBe(0);
    });

    it('ajustarSaldo should reject a usuario that is not a moderador', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.ajustarSaldo(perfil.id, 50, perfil.usuario.id))
            .rejects.toHaveProperty("message", "Only a moderador can change the saldo of a perfil miembro");
        expect((await perfilRepository.findOneBy({ id: perfil.id }))!.saldo).toBe(perfil.saldo);
    });

    it('ajustarSaldo should reject a negative or decimal saldo', async () => {
        const moderador = await crearModerador();
        await expect(() => service.ajustarSaldo(perfilesList[0].id, -1, moderador.id))
            .rejects.toHaveProperty("message", "The saldo must be an integer greater than or equal to 0");
        await expect(() => service.ajustarSaldo(perfilesList[0].id, 1.5, moderador.id))
            .rejects.toHaveProperty("message", "The saldo must be an integer greater than or equal to 0");
    });

    it('ajustarSaldo should throw an exception for an invalid perfil', async () => {
        const moderador = await crearModerador();
        await expect(() => service.ajustarSaldo("0", 10, moderador.id))
            .rejects.toHaveProperty("message", "The perfil miembro with the given id was not found");
    });
});
