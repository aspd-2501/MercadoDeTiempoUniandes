/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/post-ayuda.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PostAyudaEntity } from './post-ayuda.entity';
import { PostAyudaCategoriaEntity } from './post-ayuda-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Injectable()
export class PostAyudaService {
    constructor(
        @InjectRepository(PostAyudaEntity)
        private readonly postAyudaRepository: Repository<PostAyudaEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(CategoriaEntity)
        private readonly categoriaRepository: Repository<CategoriaEntity>,

        @InjectRepository(PostAyudaCategoriaEntity)
        private readonly postCategoriaRepository: Repository<PostAyudaCategoriaEntity>
    ) {}

    // --- CRUD de PostAyuda ---

    async findAll(): Promise<PostAyudaEntity[]> {
        return await this.postAyudaRepository.find({
            relations: { perfilAutor: true, categorias: true }
        });
    }

    async findOne(id: string): Promise<PostAyudaEntity> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id },
            relations: { perfilAutor: true, categorias: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);
        return post;
    }

    async create(post: PostAyudaEntity, categoriaIds: string[]): Promise<PostAyudaEntity> {
        if (!post.perfilAutor)
            throw new BusinessLogicException("A post ayuda must have a perfil autor", BusinessError.PRECONDITION_FAILED);
        const autor = await this.perfilMiembroRepository.findOne({ where: { id: post.perfilAutor.id } });
        if (!autor)
            throw new BusinessLogicException("The perfil autor with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        const nuevoPost = await this.postAyudaRepository.save(post);

        const relaciones = categoriaIds.map(idCategoria =>
            this.postCategoriaRepository.create({ idPostAyuda: nuevoPost.id, idCategoria })
        );
        await this.postCategoriaRepository.save(relaciones);

        const postCompleto: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: nuevoPost.id },
            relations: { perfilAutor: true, categorias: true }
        });
        return postCompleto as PostAyudaEntity;
    }

    async update(id: string, post: PostAyudaEntity): Promise<PostAyudaEntity> {
        const persisted: PostAyudaEntity | null = await this.postAyudaRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);
        post.id = id;
        return await this.postAyudaRepository.save(post);
    }

    async delete(id: string) {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({ where: { id } });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);
        await this.postAyudaRepository.remove(post);
    }

    // --- Categorías (1 a 3 por post, regla pendiente desde el diagrama) ---

    async findCategoriasByPostId(postId: string): Promise<CategoriaEntity[]> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { categorias: { categoria: true } }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        return post.categorias.map(c => c.categoria);
    }

    async associateCategoriasPost(postId: string, categoriaIds: string[]): Promise<PostAyudaEntity> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({ where: { id: postId } });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        await this.postCategoriaRepository.delete({ idPostAyuda: postId });

        const relaciones = categoriaIds.map(idCategoria =>
            this.postCategoriaRepository.create({ idPostAyuda: postId, idCategoria })
        );
        await this.postCategoriaRepository.save(relaciones);

        const postActualizado: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { categorias: true }
        });
        return postActualizado as PostAyudaEntity;
    }

    private async validarCategorias(categoriaIds: string[]) {
        if (!categoriaIds || categoriaIds.length < 1 || categoriaIds.length > 3)
            throw new BusinessLogicException("A post ayuda must have between 1 and 3 categorias", BusinessError.PRECONDITION_FAILED);

        for (const idCategoria of categoriaIds) {
            const categoria = await this.categoriaRepository.findOne({ where: { id: idCategoria } });
            if (!categoria)
                throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        }
    }
}