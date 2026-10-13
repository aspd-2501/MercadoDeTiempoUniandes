/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { UsuarioPostEntity } from './usuario-post.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class PostComunitarioService {
    constructor(
        @InjectRepository(PostComunitarioEntity)
        private readonly postComunitarioRepository: Repository<PostComunitarioEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(UsuarioPostEntity)
        private readonly usuarioPostRepository: Repository<UsuarioPostEntity>
    ) {}

    // --- CRUD de PostComunitario ---

    async findAll(): Promise<PostComunitarioEntity[]> {
        return await this.postComunitarioRepository.find({ relations: { participantes: true } });
    }

    async findOne(id: string): Promise<PostComunitarioEntity> {
        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id },
            relations: { participantes: true }
        });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);
        return post;
    }

    async create(post: PostComunitarioEntity, perfilIds: string[]): Promise<PostComunitarioEntity> {
        if (!perfilIds || perfilIds.length < 2)
            throw new BusinessLogicException("A post comunitario must have at least 2 participantes", BusinessError.PRECONDITION_FAILED);

        for (const id of perfilIds) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
        }

        post.likes = 0;
        const nuevoPost = await this.postComunitarioRepository.save(post);

        const participantes = perfilIds.map(idPerfil =>
            this.usuarioPostRepository.create({ idPostComunitario: nuevoPost.id, idPerfil })
        );
        await this.usuarioPostRepository.save(participantes);

        const postCompleto: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: nuevoPost.id },
            relations: { participantes: true }
        });
        return postCompleto as PostComunitarioEntity;
    }

    async update(id: string, post: PostComunitarioEntity): Promise<PostComunitarioEntity> {
        const persisted: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);
        post.id = id;
        return await this.postComunitarioRepository.save(post);
    }

    async delete(id: string) {
        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({ where: { id } });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);
        await this.postComunitarioRepository.remove(post);
    }

    // --- Relación con PerfilMiembro (vía UsuarioPost) ---

    async addParticipantePost(postId: string, perfilId: string): Promise<PostComunitarioEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: postId },
            relations: { participantes: true }
        });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);

        const yaParticipa = post.participantes.some(p => p.idPerfil === perfilId);
        if (yaParticipa)
            throw new BusinessLogicException("The perfil is already a participante in the post", BusinessError.PRECONDITION_FAILED);

        const participante = this.usuarioPostRepository.create({ idPostComunitario: postId, idPerfil: perfilId });
        await this.usuarioPostRepository.save(participante);

        const postActualizado: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: postId },
            relations: { participantes: true }
        });
        return postActualizado as PostComunitarioEntity;
    }

    async findParticipantesByPostId(postId: string): Promise<PerfilMiembroEntity[]> {
        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: postId },
            relations: { participantes: { perfil: true } }
        });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);

        return post.participantes.map(p => p.perfil);
    }

    async deleteParticipantePost(postId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: postId },
            relations: { participantes: true }
        });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);

        const participante = post.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participante in the post", BusinessError.PRECONDITION_FAILED);

        if (post.participantes.length <= 2)
            throw new BusinessLogicException("A post comunitario must keep at least 2 participantes", BusinessError.PRECONDITION_FAILED);

        await this.usuarioPostRepository.delete({ idPostComunitario: postId, idPerfil: perfilId });
    }
}