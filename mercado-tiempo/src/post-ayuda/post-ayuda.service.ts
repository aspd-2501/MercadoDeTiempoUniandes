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
import { HorarioDisponibleEntity } from '../horario-disponible/horario-disponible.entity';

// --- Franja recibida al crear el post o al agregarle horarios ---
export interface FranjaHoraria {
    fechaInicio: Date;
    fechaFin: Date;
    preferido?: boolean;   // horario preferido del autor (uno por post)
}

const inicioMs = (h: { fechaInicio: Date }) => new Date(h.fechaInicio).getTime();

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
        private readonly postCategoriaRepository: Repository<PostAyudaCategoriaEntity>,

        @InjectRepository(HorarioDisponibleEntity)
        private readonly horarioRepository: Repository<HorarioDisponibleEntity>
    ) {}

    // --- CRUD de PostAyuda ---

    async findAll(): Promise<PostAyudaEntity[]> {
        return await this.postAyudaRepository.find({
            relations: { perfilAutor: true, categorias: true, horariosDisponibles: true }
        });
    }

    async findOne(id: string): Promise<PostAyudaEntity> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id },
            relations: { perfilAutor: true, categorias: true, horariosDisponibles: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);
        return post;
    }

    async create(post: PostAyudaEntity, categoriaIds: string[], horarios: FranjaHoraria[]): Promise<PostAyudaEntity> {
        if (!post.perfilAutor)
            throw new BusinessLogicException("A post ayuda must have a perfil autor", BusinessError.PRECONDITION_FAILED);
        const autor = await this.perfilMiembroRepository.findOne({ where: { id: post.perfilAutor.id } });
        if (!autor)
            throw new BusinessLogicException("The perfil autor with the given id was not found", BusinessError.NOT_FOUND);

        if (!post.horas || post.horas <= 0)
            throw new BusinessLogicException("The horas of a post ayuda must be positive", BusinessError.PRECONDITION_FAILED);

        await this.validarCategorias(categoriaIds);

        // RF-036: al menos una franja, y cada una debe alcanzar para las horas del post
        if (!horarios || horarios.length < 1)
            throw new BusinessLogicException("A post ayuda must have at least 1 horario disponible", BusinessError.PRECONDITION_FAILED);
        horarios.forEach(franja => this.validarFranja(franja, post.horas));

        // Exactamente un horario preferido: el marcado o, si no hay ninguno, el que empieza primero
        const marcadas = horarios.filter(franja => franja.preferido === true);
        if (marcadas.length > 1)
            throw new BusinessLogicException("Only one horario of a post ayuda can be preferido", BusinessError.PRECONDITION_FAILED);
        const preferida = marcadas[0] ?? [...horarios].sort((a, b) => inicioMs(a) - inicioMs(b))[0];

        const nuevoPost = await this.postAyudaRepository.save(post);

        const relaciones = categoriaIds.map(idCategoria =>
            this.postCategoriaRepository.create({ idPostAyuda: nuevoPost.id, idCategoria })
        );
        await this.postCategoriaRepository.save(relaciones);

        const franjas = horarios.map(franja =>
            this.horarioRepository.create({
                fechaInicio: franja.fechaInicio,
                fechaFin: franja.fechaFin,
                preferido: franja === preferida,
                postAyuda: { id: nuevoPost.id },
                perfil: { id: autor.id },
            })
        );
        await this.horarioRepository.save(franjas);

        return await this.findOne(nuevoPost.id);
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

    // --- Horarios disponibles del post (RF-036) ---

    async findHorariosByPostId(postId: string): Promise<HorarioDisponibleEntity[]> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { horariosDisponibles: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        return post.horariosDisponibles.sort((a, b) => inicioMs(a) - inicioMs(b));
    }

    // El horario preferido del post (preferencia inicial del autor; el horario final se define en el acuerdo)
    async marcarHorarioPreferido(postId: string, horarioId: string): Promise<PostAyudaEntity> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { horariosDisponibles: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        if (!post.horariosDisponibles.some(h => h.id === horarioId))
            throw new BusinessLogicException("The horario disponible is not associated with the post ayuda", BusinessError.PRECONDITION_FAILED);

        await this.cambiarPreferido(postId, horarioId);
        return await this.findOne(postId);
    }

    async addHorarioPost(postId: string, franja: FranjaHoraria): Promise<PostAyudaEntity> {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { perfilAutor: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        this.validarFranja(franja, post.horas);

        const horario = this.horarioRepository.create({
            fechaInicio: franja.fechaInicio,
            fechaFin: franja.fechaFin,
            preferido: false,
            postAyuda: { id: postId },
            perfil: { id: post.perfilAutor.id },
        });
        const nuevo = await this.horarioRepository.save(horario);
        if (franja.preferido === true)
            await this.cambiarPreferido(postId, nuevo.id);

        return await this.findOne(postId);
    }

    async deleteHorarioPost(postId: string, horarioId: string) {
        const post: PostAyudaEntity | null = await this.postAyudaRepository.findOne({
            where: { id: postId },
            relations: { horariosDisponibles: true }
        });
        if (!post)
            throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);

        const horario = post.horariosDisponibles.find(h => h.id === horarioId);
        if (!horario)
            throw new BusinessLogicException("The horario disponible is not associated with the post ayuda", BusinessError.PRECONDITION_FAILED);

        if (post.horariosDisponibles.length <= 1)
            throw new BusinessLogicException("A post ayuda must keep at least 1 horario disponible", BusinessError.PRECONDITION_FAILED);

        await this.horarioRepository.remove(horario);

        // Si se borró el preferido, pasa a serlo la franja restante que empieza primero
        if (horario.preferido) {
            const siguiente = post.horariosDisponibles
                .filter(h => h.id !== horarioId)
                .sort((a, b) => inicioMs(a) - inicioMs(b))[0];
            await this.cambiarPreferido(postId, siguiente.id);
        }
    }

    // Deja como preferida solo la franja indicada
    private async cambiarPreferido(postId: string, horarioId: string) {
        await this.horarioRepository.manager.transaction(async manager => {
            await manager.update(HorarioDisponibleEntity, { postAyuda: { id: postId } }, { preferido: false });
            await manager.update(HorarioDisponibleEntity, { id: horarioId }, { preferido: true });
        });
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

    // La franja debe terminar después de empezar y durar al menos las horas del post
    private validarFranja(franja: FranjaHoraria, horas: number) {
        const inicio = new Date(franja.fechaInicio).getTime();
        const fin = new Date(franja.fechaFin).getTime();

        if (isNaN(inicio) || isNaN(fin) || fin <= inicio)
            throw new BusinessLogicException("The fechaFin of a horario must be after its fechaInicio", BusinessError.PRECONDITION_FAILED);

        const horasFranja = (fin - inicio) / (1000 * 60 * 60);
        if (horasFranja < horas)
            throw new BusinessLogicException("Each horario must last at least the horas of the post ayuda", BusinessError.PRECONDITION_FAILED);
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