/* eslint-disable prettier/prettier */
/* archivo: src/post-comunitario/post-comunitario.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PostComunitarioEntity } from './post-comunitario.entity';
import { UsuarioPostEntity } from './usuario-post.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';

@Injectable()
export class PostComunitarioService {
    constructor(
        @InjectRepository(PostComunitarioEntity)
        private readonly postComunitarioRepository: Repository<PostComunitarioEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(UsuarioPostEntity)
        private readonly usuarioPostRepository: Repository<UsuarioPostEntity>,

        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>
    ) {}

    // --- CRUD de PostComunitario ---

    async findAll(): Promise<PostComunitarioEntity[]> {
        return await this.postComunitarioRepository.find({ relations: { participantes: true, creador: true, acuerdo: true } });
    }

    async findOne(id: string): Promise<PostComunitarioEntity> {
        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id },
            relations: { participantes: true, creador: true, acuerdo: true }
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

        if (!post.creador)
            throw new BusinessLogicException("A post comunitario must have a creador", BusinessError.PRECONDITION_FAILED);
        const creador = await this.perfilMiembroRepository.findOne({ where: { id: post.creador.id } });
        if (!creador)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        if (post.acuerdo) {
            const acuerdo = await this.acuerdoRepository.findOne({ where: { id: post.acuerdo.id } });
            if (!acuerdo)
                throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        }

        post.likes = 0;
        post.aprobaciones = 0;
        post.publico = false;
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
        // aprobaciones y publico solo cambian a través de aprobarPost
        post.id = id;
        post.aprobaciones = persisted.aprobaciones;
        post.publico = persisted.publico;
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
        await this.recalcularAprobaciones(postId);

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
        await this.recalcularAprobaciones(postId);
    }

    // --- Aprobaciones: el post se vuelve público cuando todos los taggeados lo aprueban ---

    async aprobarPost(postId: string, perfilId: string): Promise<PostComunitarioEntity> {
        const post: PostComunitarioEntity | null = await this.postComunitarioRepository.findOne({
            where: { id: postId },
            relations: { participantes: true }
        });
        if (!post)
            throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);

        const participante = post.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participante in the post", BusinessError.PRECONDITION_FAILED);
        if (participante.aprobado)
            throw new BusinessLogicException("The perfil already approved the post", BusinessError.PRECONDITION_FAILED);

        participante.aprobado = true;
        await this.usuarioPostRepository.save(participante);
        return await this.recalcularAprobaciones(postId);
    }

    private async recalcularAprobaciones(postId: string): Promise<PostComunitarioEntity> {
        const post = await this.findOne(postId);
        const taggeados = post.participantes.length;
        post.aprobaciones = post.participantes.filter(p => p.aprobado).length;
        post.publico = taggeados > 0 && post.aprobaciones === taggeados;
        return await this.postComunitarioRepository.save(post);
    }
}