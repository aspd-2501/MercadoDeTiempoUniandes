/* eslint-disable prettier/prettier */
/* archivo: src/reconocimiento/reconocimiento.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ReconocimientoEntity } from './reconocimiento.entity';
import { ReconocimientoOtorgadoEntity } from './reconocimiento-otorgado.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { UsuarioPostEntity } from '../post-comunitario/usuario-post.entity';

@Injectable()
export class ReconocimientoService {
    constructor(
        @InjectRepository(ReconocimientoEntity)
        private readonly reconocimientoRepository: Repository<ReconocimientoEntity>,

        @InjectRepository(ReconocimientoOtorgadoEntity)
        private readonly otorgadoRepository: Repository<ReconocimientoOtorgadoEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(PostComunitarioEntity)
        private readonly postComunitarioRepository: Repository<PostComunitarioEntity>,

        @InjectRepository(UsuarioPostEntity)
        private readonly usuarioPostRepository: Repository<UsuarioPostEntity>
    ) {}

    // --- CRUD del catálogo de Reconocimiento ---

    async findAll(): Promise<ReconocimientoEntity[]> {
        return await this.reconocimientoRepository.find();
    }

    async findOne(id: string): Promise<ReconocimientoEntity> {
        const reconocimiento: ReconocimientoEntity | null = await this.reconocimientoRepository.findOne({ where: { id } });
        if (!reconocimiento)
            throw new BusinessLogicException("The reconocimiento with the given id was not found", BusinessError.NOT_FOUND);
        return reconocimiento;
    }

    async create(reconocimiento: ReconocimientoEntity): Promise<ReconocimientoEntity> {
        return await this.reconocimientoRepository.save(reconocimiento);
    }

    async update(id: string, reconocimiento: ReconocimientoEntity): Promise<ReconocimientoEntity> {
        const persisted: ReconocimientoEntity | null = await this.reconocimientoRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The reconocimiento with the given id was not found", BusinessError.NOT_FOUND);
        reconocimiento.id = id;
        return await this.reconocimientoRepository.save(reconocimiento);
    }

    async delete(id: string) {
        const reconocimiento: ReconocimientoEntity | null = await this.reconocimientoRepository.findOne({ where: { id } });
        if (!reconocimiento)
            throw new BusinessLogicException("The reconocimiento with the given id was not found", BusinessError.NOT_FOUND);
        await this.reconocimientoRepository.remove(reconocimiento);
    }

    // --- Otorgamiento de reconocimientos ---

    async otorgarReconocimiento(
        reconocimientoId: string,
        perfilReceptorId: string,
        perfilOtorganteId?: string,
        postComunitarioId?: string
    ): Promise<ReconocimientoOtorgadoEntity> {
        const reconocimiento = await this.reconocimientoRepository.findOne({ where: { id: reconocimientoId } });
        if (!reconocimiento)
            throw new BusinessLogicException("The reconocimiento with the given id was not found", BusinessError.NOT_FOUND);

        const perfilReceptor = await this.perfilMiembroRepository.findOne({ where: { id: perfilReceptorId } });
        if (!perfilReceptor)
            throw new BusinessLogicException("The perfil receptor with the given id was not found", BusinessError.NOT_FOUND);

        let perfilOtorgante: PerfilMiembroEntity | null = null;
        if (perfilOtorganteId) {
            if (perfilOtorganteId === perfilReceptorId)
                throw new BusinessLogicException("A perfil cannot otorgar a reconocimiento to itself", BusinessError.PRECONDITION_FAILED);

            perfilOtorgante = await this.perfilMiembroRepository.findOne({ where: { id: perfilOtorganteId } });
            if (!perfilOtorgante)
                throw new BusinessLogicException("The perfil otorgante with the given id was not found", BusinessError.NOT_FOUND);
        }

        let postComunitario: PostComunitarioEntity | null = null;
        if (postComunitarioId) {
            if (!perfilOtorganteId)
                throw new BusinessLogicException("A reconocimiento tied to a post comunitario requires a perfil otorgante", BusinessError.PRECONDITION_FAILED);

            postComunitario = await this.postComunitarioRepository.findOne({ where: { id: postComunitarioId } });
            if (!postComunitario)
                throw new BusinessLogicException("The post comunitario with the given id was not found", BusinessError.NOT_FOUND);

            const receptorEsParticipante = await this.usuarioPostRepository.findOne({
                where: { idPostComunitario: postComunitarioId, idPerfil: perfilReceptorId }
            });
            if (!receptorEsParticipante)
                throw new BusinessLogicException("The perfil receptor must be a participante of the post comunitario", BusinessError.PRECONDITION_FAILED);

            const otorganteEsParticipante = await this.usuarioPostRepository.findOne({
                where: { idPostComunitario: postComunitarioId, idPerfil: perfilOtorganteId }
            });
            if (!otorganteEsParticipante)
                throw new BusinessLogicException("The perfil otorgante must be a participante of the post comunitario", BusinessError.PRECONDITION_FAILED);
        }

        const otorgado = this.otorgadoRepository.create({
            fecha: new Date(),
            reconocimiento,
            perfilReceptor,
            perfilOtorgante: perfilOtorgante ?? undefined,
            postComunitario: postComunitario ?? undefined,
        });

        return await this.otorgadoRepository.save(otorgado);
    }

    async findOtorgamientosByPerfilReceptorId(perfilId: string): Promise<ReconocimientoOtorgadoEntity[]> {
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        return await this.otorgadoRepository.find({
            where: { perfilReceptor: { id: perfilId } },
            relations: { reconocimiento: true, perfilOtorgante: true, postComunitario: true }
        });
    }
}