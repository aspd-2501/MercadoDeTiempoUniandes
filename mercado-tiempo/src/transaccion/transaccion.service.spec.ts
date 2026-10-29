/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { TransaccionService } from './transaccion.service';
import { TransaccionEntity } from './transaccion.entity';
import { TipoTransaccion } from './tipo-transaccion.enum';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('TransaccionService', () => {
    let service: TransaccionService;
    let transaccionRepository: Repository<TransaccionEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let perfil: PerfilMiembroEntity;
    let otroPerfil: PerfilMiembroEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [TransaccionService],
        }).compile();

        service = module.get<TransaccionService>(TransaccionService);
        transaccionRepository = module.get<Repository<TransaccionEntity>>(getRepositoryToken(TransaccionEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
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
            saldo: 10,
            usuario,
        });
    };

    const seedDatabase = async () => {
        await transaccionRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfil = await createPerfil();
        otroPerfil = await createPerfil();

        await transaccionRepository.save({ tipo: TipoTransaccion.SERVICIO_RECIBIDO, horas: -2, saldoResultante: 8, perfil });
        await transaccionRepository.save({ tipo: TipoTransaccion.SERVICIO_PRESTADO, horas: 3, saldoResultante: 11, perfil });
        await transaccionRepository.save({ tipo: TipoTransaccion.SERVICIO_PRESTADO, horas: 2, saldoResultante: 12, perfil: otroPerfil });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findByPerfilId should return only the transacciones of the perfil', async () => {
        const result = await service.findByPerfilId(perfil.id);
        expect(result.length).toBe(2);
    });

    it('findByPerfilId should return an empty list for a perfil without movimientos', async () => {
        const nuevo = await createPerfil();
        const result = await service.findByPerfilId(nuevo.id);
        expect(result.length).toBe(0);
    });

    it('findByPerfilId should throw an exception for an invalid perfil', async () => {
        await expect(() => service.findByPerfilId("0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });
});
