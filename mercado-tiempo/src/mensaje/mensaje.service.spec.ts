/* eslint-disable prettier/prettier */
/* archivo: src/mensaje/mensaje.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { MensajeService } from './mensaje.service';
import { MensajeEntity } from './mensaje.entity';
import { ChatEntity } from '../chat/chat.entity';
import { ChatParticipanteEntity } from '../chat/chat-participante.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('MensajeService', () => {
    let service: MensajeService;
    let mensajeRepository: Repository<MensajeEntity>;
    let chatRepository: Repository<ChatEntity>;
    let participanteRepository: Repository<ChatParticipanteEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let chat: ChatEntity;
    let perfilMiembro: PerfilMiembroEntity;
    let perfilAjeno: PerfilMiembroEntity;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [MensajeService],
        }).compile();

        service = module.get<MensajeService>(MensajeService);
        mensajeRepository = module.get<Repository<MensajeEntity>>(getRepositoryToken(MensajeEntity));
        chatRepository = module.get<Repository<ChatEntity>>(getRepositoryToken(ChatEntity));
        participanteRepository = module.get<Repository<ChatParticipanteEntity>>(getRepositoryToken(ChatParticipanteEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        usuarioRepository = module.get<Repository<UsuarioEntity>>(getRepositoryToken(UsuarioEntity));

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
        await mensajeRepository.clear();
        await participanteRepository.clear();
        await chatRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfilMiembro = await createPerfil();
        const otroPerfil = await createPerfil();
        perfilAjeno = await createPerfil();

        chat = await chatRepository.save({});
        await participanteRepository.save({ idChat: chat.id, idPerfil: perfilMiembro.id });
        await participanteRepository.save({ idChat: chat.id, idPerfil: otroPerfil.id });
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('create should save a mensaje from a participante', async () => {
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilMiembro,
        } as MensajeEntity;

        const result = await service.create(mensaje);
        expect(result).not.toBeNull();

        const stored = await mensajeRepository.findOne({
            where: { id: result.id },
            relations: { chat: true, emisor: true }
        });
        expect(stored!.contenido).toBe(mensaje.contenido);
        expect(stored!.emisor.id).toBe(perfilMiembro.id);
        expect(stored!.chat.id).toBe(chat.id);
    });

    it('create should throw an exception without an emisor', async () => {
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "A mensaje must have an emisor");
    });

    it('create should throw an exception for an invalid emisor', async () => {
        const invalidPerfil: PerfilMiembroEntity = { ...perfilMiembro, id: "0" } as PerfilMiembroEntity;
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: invalidPerfil,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "The perfil emisor with the given id was not found");
    });

    it('create should throw an exception without a chat', async () => {
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            emisor: perfilMiembro,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "A mensaje must belong to a chat");
    });

    it('create should throw an exception for an invalid chat', async () => {
        const invalidChat: ChatEntity = { ...chat, id: "0" } as ChatEntity;
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat: invalidChat,
            emisor: perfilMiembro,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('create should throw an exception when emisor is not a participante of the chat', async () => {
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilAjeno,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "The emisor is not a participant in the chat");
    });

    it('create should throw an exception for empty contenido', async () => {
        const mensaje: MensajeEntity = {
            id: "",
            fecha: faker.date.recent(),
            contenido: "   ",
            chat,
            emisor: perfilMiembro,
        } as MensajeEntity;

        await expect(() => service.create(mensaje))
            .rejects.toHaveProperty("message", "A mensaje cannot have empty contenido");
    });

    it('findAll should return all mensajes', async () => {
        await mensajeRepository.save({
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilMiembro,
        });

        const mensajes = await service.findAll();
        expect(mensajes.length).toBe(1);
    });

    it('findOne should return a mensaje by id', async () => {
        const saved = await mensajeRepository.save({
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilMiembro,
        });

        const result = await service.findOne(saved.id);
        expect(result).not.toBeNull();
        expect(result.contenido).toBe(saved.contenido);
    });

    it('findOne should throw an exception for an invalid mensaje', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The mensaje with the given id was not found");
    });

    it('findByChatId should return mensajes for a chat', async () => {
        await mensajeRepository.save({
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilMiembro,
        });

        const mensajes = await service.findByChatId(chat.id);
        expect(mensajes.length).toBe(1);
    });

    it('findByChatId should throw an exception for an invalid chat', async () => {
        await expect(() => service.findByChatId("0"))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('delete should remove a mensaje', async () => {
        const saved = await mensajeRepository.save({
            fecha: faker.date.recent(),
            contenido: faker.lorem.sentence(),
            chat,
            emisor: perfilMiembro,
        });

        await service.delete(saved.id);
        const deleted = await mensajeRepository.findOne({ where: { id: saved.id } });
        expect(deleted).toBeNull();
    });

    it('delete should throw an exception for an invalid mensaje', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The mensaje with the given id was not found");
    });
});