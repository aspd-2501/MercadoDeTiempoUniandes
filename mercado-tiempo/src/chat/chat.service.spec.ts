/* eslint-disable prettier/prettier */
/* archivo: src/chat/chat.service.spec.ts */
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { ChatService } from './chat.service';
import { ChatEntity } from './chat.entity';
import { ChatParticipanteEntity } from './chat-participante.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';

describe('ChatService', () => {
    let service: ChatService;
    let chatRepository: Repository<ChatEntity>;
    let perfilRepository: Repository<PerfilMiembroEntity>;
    let participanteRepository: Repository<ChatParticipanteEntity>;
    let usuarioRepository: Repository<UsuarioEntity>;

    let chat: ChatEntity;
    let perfilesList: PerfilMiembroEntity[];

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [...TypeOrmTestingConfig()],
            providers: [ChatService],
        }).compile();

        service = module.get<ChatService>(ChatService);
        chatRepository = module.get<Repository<ChatEntity>>(getRepositoryToken(ChatEntity));
        perfilRepository = module.get<Repository<PerfilMiembroEntity>>(getRepositoryToken(PerfilMiembroEntity));
        participanteRepository = module.get<Repository<ChatParticipanteEntity>>(getRepositoryToken(ChatParticipanteEntity));
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
        await participanteRepository.clear();
        await chatRepository.clear();
        await perfilRepository.clear();
        await usuarioRepository.clear();

        perfilesList = [];
        for (let i = 0; i < 3; i++) {
            perfilesList.push(await createPerfil());
        }

        chat = await chatRepository.save({});
        for (const p of perfilesList) {
            await participanteRepository.save({ idChat: chat.id, idPerfil: p.id });
        }
    };

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('findAll should return all chats', async () => {
        const chats: ChatEntity[] = await service.findAll();
        expect(chats.length).toBe(1);
    });

    it('findOne should return a chat by id', async () => {
        const result = await service.findOne(chat.id);
        expect(result).not.toBeNull();
        expect(result.participantes.length).toBe(3);
    });

    it('findOne should throw an exception for an invalid chat', async () => {
        await expect(() => service.findOne("0"))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('create should return a new chat with at least 2 participantes', async () => {
        const p1 = await createPerfil();
        const p2 = await createPerfil();
        const newChat = await service.create([p1, p2]);
        expect(newChat.participantes.length).toBe(2);
    });

    it('create should throw an exception with fewer than 2 participantes', async () => {
        const p1 = await createPerfil();
        await expect(() => service.create([p1]))
            .rejects.toHaveProperty("message", "A chat must have at least 2 participantes");
    });

    it('create should throw an exception for an invalid perfil', async () => {
        const p1 = await createPerfil();
        const invalidPerfil: PerfilMiembroEntity = { ...p1, id: "0" } as PerfilMiembroEntity;
        await expect(() => service.create([p1, invalidPerfil]))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('delete should remove a chat', async () => {
        await service.delete(chat.id);
        const deletedChat = await chatRepository.findOne({ where: { id: chat.id } });
        expect(deletedChat).toBeNull();
    });

    it('delete should throw an exception for an invalid chat', async () => {
        await expect(() => service.delete("0"))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('addPerfilChat should add a perfil to a chat', async () => {
        const newPerfil = await createPerfil();
        const result = await service.addPerfilChat(chat.id, newPerfil.id);
        expect(result.participantes.length).toBe(4);
    });

    it('addPerfilChat should throw an exception for an invalid perfil', async () => {
        await expect(() => service.addPerfilChat(chat.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('addPerfilChat should throw an exception for an invalid chat', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.addPerfilChat("0", newPerfil.id))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('addPerfilChat should throw an exception for an already participating perfil', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.addPerfilChat(chat.id, perfil.id))
            .rejects.toHaveProperty("message", "The perfil is already a participant in the chat");
    });

    it('findPerfilesByChatId should return perfiles by chat', async () => {
        const perfiles = await service.findPerfilesByChatId(chat.id);
        expect(perfiles.length).toBe(3);
    });

    it('findPerfilesByChatId should throw an exception for an invalid chat', async () => {
        await expect(() => service.findPerfilesByChatId("0"))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('deletePerfilChat should remove a perfil from a chat', async () => {
        const perfil = perfilesList[0];
        await service.deletePerfilChat(chat.id, perfil.id);

        const stored = await chatRepository.findOne({ where: { id: chat.id }, relations: { participantes: true } });
        expect(stored!.participantes.length).toBe(2);
    });

    it('deletePerfilChat should throw an exception for an invalid perfil', async () => {
        await expect(() => service.deletePerfilChat(chat.id, "0"))
            .rejects.toHaveProperty("message", "The perfil with the given id was not found");
    });

    it('deletePerfilChat should throw an exception for an invalid chat', async () => {
        const perfil = perfilesList[0];
        await expect(() => service.deletePerfilChat("0", perfil.id))
            .rejects.toHaveProperty("message", "The chat with the given id was not found");
    });

    it('deletePerfilChat should throw an exception for a non-participating perfil', async () => {
        const newPerfil = await createPerfil();
        await expect(() => service.deletePerfilChat(chat.id, newPerfil.id))
            .rejects.toHaveProperty("message", "The perfil with the given id is not a participant in the chat");
    });

    it('deletePerfilChat should throw an exception when it would leave fewer than 2 participantes', async () => {
        await service.deletePerfilChat(chat.id, perfilesList[0].id);
        await expect(() => service.deletePerfilChat(chat.id, perfilesList[1].id))
            .rejects.toHaveProperty("message", "A chat must keep at least 2 participantes");
    });
});