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

describe('DonacionService', () => {
    let service: DonacionService;
    let donacionRepository: Repository<DonacionEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;
    let depositoRepository: Repository<DepositoHorasEntity>;

    let perfilA: PerfilMiembroEntity;
    let perfilB: PerfilMiembroEntity;
    let depositoA: DepositoHorasEntity;
    let depositoB: DepositoHorasEntity;

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
        await donacionRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();
        await depositoRepository.clear();

        perfilA = await createPerfil();
        perfilB = await createPerfil();
        depositoA = await depositoRepository.save({ saldo: 10 });
        depositoB = await depositoRepository.save({ saldo: 20 });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a donacion from perfil to perfil', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 2,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            perfilReceptor: perfilB,
        } as DonacionEntity;

        const result = await service.create(donacion);
        expect(result).not.toBeNull();

        const stored = await donacionRepository.findOne({
            where: { id: result.id },
            relations: { perfilDonante: true, perfilReceptor: true }
        });
        expect(stored!.perfilDonante.id).toBe(perfilA.id);
        expect(stored!.perfilReceptor.id).toBe(perfilB.id);
    });

    it('create should save a donacion from perfil to deposito', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 3,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            depositoReceptor: depositoA,
        } as DonacionEntity;

        const result = await service.create(donacion);
        const stored = await donacionRepository.findOne({
            where: { id: result.id },
            relations: { perfilDonante: true, depositoReceptor: true }
        });
        expect(stored!.perfilDonante.id).toBe(perfilA.id);
        expect(stored!.depositoReceptor.id).toBe(depositoA.id);
    });

    it('create should save a donacion from deposito to perfil', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            depositoDonante: depositoA,
            perfilReceptor: perfilB,
        } as DonacionEntity;

        const result = await service.create(donacion);
        const stored = await donacionRepository.findOne({
            where: { id: result.id },
            relations: { depositoDonante: true, perfilReceptor: true }
        });
        expect(stored!.depositoDonante.id).toBe(depositoA.id);
        expect(stored!.perfilReceptor.id).toBe(perfilB.id);
    });

    it('create should throw an exception when donante has neither perfil nor deposito', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilReceptor: perfilB,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "A donacion must have exactly one donante: a perfil or a deposito");
    });

    it('create should throw an exception when donante has both perfil and deposito', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            depositoDonante: depositoA,
            perfilReceptor: perfilB,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "A donacion must have exactly one donante: a perfil or a deposito");
    });

    it('create should throw an exception when receptor has neither perfil nor deposito', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "A donacion must have exactly one receptor: a perfil or a deposito");
    });

    it('create should throw an exception for an invalid perfil donante', async () => {
        const invalidPerfil: PerfilMiembroEntity = { ...perfilA, id: "0" } as PerfilMiembroEntity;
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: invalidPerfil,
            perfilReceptor: perfilB,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "The perfil donante with the given id was not found");
    });

    it('create should throw an exception when perfil donante and receptor are the same', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            perfilReceptor: perfilA,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "The donante and receptor perfiles cannot be the same");
    });

    it('create should throw an exception when deposito donante and receptor are the same', async () => {
        const donacion: DonacionEntity = {
            id: "",
            horasDonadas: 1,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            depositoDonante: depositoA,
            depositoReceptor: depositoA,
        } as DonacionEntity;

        await expect(() => service.create(donacion))
            .rejects.toHaveProperty("message", "The donante and receptor depositos cannot be the same");
    });

    it('findOne should return a donacion by id', async () => {
        const saved = await donacionRepository.save({
            horasDonadas: 2,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            perfilReceptor: perfilB,
        });

        const result = await service.findOne(saved.id);
        expect(result).not.toBeNull();
        expect(result.horasDonadas).toBe(saved.horasDonadas);
    });

    it('findOne should throw an exception for an invalid donacion', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The donacion with the given id was not found");
    });

    it('delete should remove a donacion', async () => {
        const saved = await donacionRepository.save({
            horasDonadas: 2,
            fechaDonacion: faker.date.recent(),
            mensaje: faker.lorem.sentence(),
            perfilDonante: perfilA,
            perfilReceptor: perfilB,
        });

        await service.delete(saved.id);
        const deleted = await donacionRepository.findOne({ where: { id: saved.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid donacion', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The donacion with the given id was not found");
    });
});