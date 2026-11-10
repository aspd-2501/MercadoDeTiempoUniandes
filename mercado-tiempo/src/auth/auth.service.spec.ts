/* eslint-disable prettier/prettier */
/* archivo: src/auth/auth.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';

describe('AuthService', () => {
    let service: AuthService;
    let usuarioService: UsuarioService;
    let jwtService: JwtService;
    let usuarioRepository: Repository<UsuarioEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let moderadorRepository: Repository<ModeradorEntity>;

    const CONTRASENIA = 'clave-segura-123';

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig(), JwtModule.register({ secret: 'secreto-de-prueba', signOptions: { expiresIn: '1h' } })],
            providers: [AuthService, UsuarioService],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usuarioService = module.get<UsuarioService>(UsuarioService);
        jwtService = module.get<JwtService>(JwtService);
        usuarioRepository = module.get(getRepositoryToken(UsuarioEntity));
        perfilRepository = module.get(getRepositoryToken(PerfilMiembroEntity));
        moderadorRepository = module.get(getRepositoryToken(ModeradorEntity));

        await moderadorRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();
    });

    // Crea el usuario con UsuarioService para que la contraseña quede cifrada como en la aplicación
    const crearUsuario = async (): Promise<UsuarioEntity> =>
        await usuarioService.create({ idUniandes: faker.string.alphanumeric(10), contrasenia: CONTRASENIA } as UsuarioEntity);

    const crearPerfil = async (usuario: UsuarioEntity): Promise<PerfilMiembroEntity> =>
        await perfilRepository.save({
            nombre: 'Ana Martínez', edad: 21, afiliacionUniandes: 'Estudiante', imagen: faker.image.url(),
            descripcion: 'Estudiante de ingeniería', estadoActividad: true, saldo: 10, usuario,
        });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('login should return the token, the usuario without contrasenia and its perfil', async () => {
        const usuario = await crearUsuario();
        const perfil = await crearPerfil(usuario);

        const result = await service.login(usuario.idUniandes, CONTRASENIA);

        expect(result.access_token.split('.').length).toBe(3);
        expect(result.usuario.id).toBe(usuario.id);
        expect(result.usuario).not.toHaveProperty('contrasenia');
        expect(result.perfil!.id).toBe(perfil.id);
        expect(result.perfil!.saldo).toBe(10);
        expect(result.esModerador).toBe(false);
    });

    it('login should put the usuario id in the token', async () => {
        const usuario = await crearUsuario();
        const result = await service.login(usuario.idUniandes, CONTRASENIA);
        const payload = await jwtService.verifyAsync(result.access_token);
        expect(payload.sub).toBe(usuario.id);
    });

    it('login should return perfil null when the usuario has not created it yet', async () => {
        const usuario = await crearUsuario();
        const result = await service.login(usuario.idUniandes, CONTRASENIA);
        expect(result.perfil).toBeNull();
    });

    it('login should tell when the usuario is a moderador', async () => {
        const usuario = await crearUsuario();
        await moderadorRepository.save({ usuario });
        const result = await service.login(usuario.idUniandes, CONTRASENIA);
        expect(result.esModerador).toBe(true);
    });

    it('login should throw an exception for a wrong contrasenia', async () => {
        const usuario = await crearUsuario();
        await expect(() => service.login(usuario.idUniandes, 'otra-clave'))
            .rejects.toHaveProperty("message", "Invalid credentials");
    });

    it('sesion should return the same data as the login for the usuario of the token', async () => {
        const usuario = await crearUsuario();
        const perfil = await crearPerfil(usuario);
        const result = await service.sesion(usuario.id);
        expect(result.usuario.id).toBe(usuario.id);
        expect(result.perfil!.id).toBe(perfil.id);
    });

    it('sesion should throw an exception for a usuario that no longer exists', async () => {
        await expect(() => service.sesion("0"))
            .rejects.toHaveProperty("message", "The usuario with the given id was not found");
    });
});
