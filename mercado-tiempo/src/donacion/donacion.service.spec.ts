/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { DonacionService } from './donacion.service';
import { DonacionEntity } from './donacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

describe('DonacionService', () => {
    let service: DonacionService;
    let donacionRepository: Repository<DonacionEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let depositoRepository: Repository<DepositoHorasEntity>;
    let transaccionRepository: Repository<TransaccionEntity>;

    let perfilA: PerfilMiembroEntity;   // saldo 10
    let perfilB: PerfilMiembroEntity;   // saldo 5
    let fondo: DepositoHorasEntity;     // saldo 20

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [DonacionService],
        }).compile();

        service = module.get<DonacionService>(DonacionService);
        donacionRepository = module.get<Repository<DonacionEntity>>(getRepositoryToken(DonacionEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));
        depositoRepository = module.get<Repository<DepositoHorasEntity>>(getRepositoryToken(DepositoHorasEntity));
        transaccionRepository = module.get<Repository<TransaccionEntity>>(getRepositoryToken(TransaccionEntity));

        await seedDatabase();
    });

    const createPerfil = async (saldo: number): Promise<PerfilMiembroEntity> => {
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
            saldo,
            usuario,
        });
    };

    const seedDatabase = async () => {
        await transaccionRepository.clear();
        await donacionRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();
        await depositoRepository.clear();

        perfilA = await createPerfil(10);
        perfilB = await createPerfil(5);
        fondo = await depositoRepository.save({ saldo: 20 });
    };

    const donacion = (horas: number, partes: Partial<DonacionEntity>): DonacionEntity =>
        ({ horasDonadas: horas, fechaDonacion: faker.date.recent(), mensaje: faker.lorem.sentence(), ...partes }) as DonacionEntity;

    const saldoPerfil = async (perfil: PerfilMiembroEntity) => (await perfilRepository.findOne({ where: { id: perfil.id } }))!.saldo;
    const saldoFondo = async () => (await depositoRepository.findOne({ where: { id: fondo.id } }))!.saldo;

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // --- Movimiento de horas ---

    it('create should move horas from perfil to perfil', async () => {
        const result = await service.create(donacion(3, { perfilDonante: perfilA, perfilReceptor: perfilB }));
        expect(result.perfilDonante.id).toBe(perfilA.id);
        expect(await saldoPerfil(perfilA)).toBe(7);
        expect(await saldoPerfil(perfilB)).toBe(8);
    });

    it('create should register one transaccion for the donante and one for the receptor', async () => {
        const result = await service.create(donacion(3, { perfilDonante: perfilA, perfilReceptor: perfilB }));
        const transacciones = await transaccionRepository.find({ where: { donacion: { id: result.id } }, relations: { perfil: true } });
        expect(transacciones.length).toBe(2);

        const enviada = transacciones.find(t => t.tipo === TipoTransaccion.DONACION_ENVIADA)!;
        const recibida = transacciones.find(t => t.tipo === TipoTransaccion.DONACION_RECIBIDA)!;
        expect(enviada.perfil.id).toBe(perfilA.id);
        expect(enviada.horas).toBe(-3);
        expect(enviada.saldoResultante).toBe(7);
        expect(recibida.perfil.id).toBe(perfilB.id);
        expect(recibida.horas).toBe(3);
    });

    it('create should move horas from a perfil to the fondo comunitario', async () => {
        await service.create(donacion(4, { perfilDonante: perfilA, depositoReceptor: fondo }));
        expect(await saldoPerfil(perfilA)).toBe(6);
        expect(await saldoFondo()).toBe(24);
    });

    it('create should move horas from the fondo comunitario to a perfil', async () => {
        await service.create(donacion(6, { depositoDonante: fondo, perfilReceptor: perfilB }));
        expect(await saldoFondo()).toBe(14);
        expect(await saldoPerfil(perfilB)).toBe(11);
    });

    it('create should throw an exception when the perfil donante does not have enough saldo', async () => {
        await expect(() => service.create(donacion(11, { perfilDonante: perfilA, perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "The perfil donante does not have enough saldo");
    });

    it('create should not save anything when the donacion fails', async () => {
        await expect(() => service.create(donacion(11, { perfilDonante: perfilA, perfilReceptor: perfilB }))).rejects.toThrow();
        expect(await donacionRepository.count()).toBe(0);
        expect(await transaccionRepository.count()).toBe(0);
        expect(await saldoPerfil(perfilA)).toBe(10);
        expect(await saldoPerfil(perfilB)).toBe(5);
    });

    it('create should throw an exception when the fondo does not have enough saldo', async () => {
        await expect(() => service.create(donacion(21, { depositoDonante: fondo, perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "The fondo comunitario does not have enough saldo");
    });

    it('create should throw an exception for 0 horas', async () => {
        await expect(() => service.create(donacion(0, { perfilDonante: perfilA, perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "The horasDonadas must be a positive integer");
    });

    // --- Validaciones de donante y receptor ---

    it('create should throw an exception when donante has neither perfil nor deposito', async () => {
        await expect(() => service.create(donacion(1, { perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "A donacion must have exactly one donante: a perfil or a deposito");
    });

    it('create should throw an exception when donante has both perfil and deposito', async () => {
        await expect(() => service.create(donacion(1, { perfilDonante: perfilA, depositoDonante: fondo, perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "A donacion must have exactly one donante: a perfil or a deposito");
    });

    it('create should throw an exception when receptor has neither perfil nor deposito', async () => {
        await expect(() => service.create(donacion(1, { perfilDonante: perfilA })))
            .rejects.toHaveProperty("message", "A donacion must have exactly one receptor: a perfil or a deposito");
    });

    it('create should throw an exception for an invalid perfil donante', async () => {
        await expect(() => service.create(donacion(1, { perfilDonante: { id: "0" } as PerfilMiembroEntity, perfilReceptor: perfilB })))
            .rejects.toHaveProperty("message", "The perfil donante with the given id was not found");
    });

    it('create should throw an exception when perfil donante and receptor are the same', async () => {
        await expect(() => service.create(donacion(1, { perfilDonante: perfilA, perfilReceptor: perfilA })))
            .rejects.toHaveProperty("message", "The donante and receptor perfiles cannot be the same");
    });

    it('create should throw an exception when the fondo donates to itself', async () => {
        await expect(() => service.create(donacion(1, { depositoDonante: fondo, depositoReceptor: fondo })))
            .rejects.toHaveProperty("message", "The donante and receptor depositos cannot be the same");
    });

    // --- Consultas ---

    it('findOne should return a donacion by id', async () => {
        const creada = await service.create(donacion(2, { perfilDonante: perfilA, perfilReceptor: perfilB }));
        const result = await service.findOne(creada.id);
        expect(result.horasDonadas).toBe(2);
    });

    it('findOne should throw an exception for an invalid donacion', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The donacion with the given id was not found");
    });
});
