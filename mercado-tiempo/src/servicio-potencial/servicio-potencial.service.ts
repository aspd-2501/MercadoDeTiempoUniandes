/* eslint-disable prettier/prettier */
/* archivo: src/servicio-potencial/servicio-potencial.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ServicioPotencialEntity } from './servicio-potencial.entity';
import { ServicioPotencialCategoriaEntity } from './servicio-potencial-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Injectable()
export class ServicioPotencialService {
    constructor(
        @InjectRepository(ServicioPotencialEntity)
        private readonly servicioPotencialRepository: Repository<ServicioPotencialEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(CategoriaEntity)
        private readonly categoriaRepository: Repository<CategoriaEntity>,

        @InjectRepository(ServicioPotencialCategoriaEntity)
        private readonly servicioCategoriaRepository: Repository<ServicioPotencialCategoriaEntity>
    ) {}

    async findAll(): Promise<ServicioPotencialEntity[]> {
        return await this.servicioPotencialRepository.find({
            relations: { perfil: true, categorias: true }
        });
    }

    async findOne(id: string): Promise<ServicioPotencialEntity> {
        const servicio: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({
            where: { id },
            relations: { perfil: true, categorias: true }
        });
        if (!servicio)
            throw new BusinessLogicException("The servicio potencial with the given id was not found", BusinessError.NOT_FOUND);
        return servicio;
    }

    async create(servicio: ServicioPotencialEntity, categoriaIds: string[]): Promise<ServicioPotencialEntity> {
        if (!servicio.perfil)
            throw new BusinessLogicException("A servicio potencial must have a perfil", BusinessError.PRECONDITION_FAILED);
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: servicio.perfil.id } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        const nuevoServicio = await this.servicioPotencialRepository.save(servicio);

        const relaciones = categoriaIds.map(idCategoria =>
            this.servicioCategoriaRepository.create({ idServicioPotencial: nuevoServicio.id, idCategoria })
        );
        await this.servicioCategoriaRepository.save(relaciones);

        const servicioCompleto: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({
            where: { id: nuevoServicio.id },
            relations: { perfil: true, categorias: true }
        });
        return servicioCompleto as ServicioPotencialEntity;
    }

    async delete(id: string) {
        const servicio: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({ where: { id } });
        if (!servicio)
            throw new BusinessLogicException("The servicio potencial with the given id was not found", BusinessError.NOT_FOUND);
        await this.servicioPotencialRepository.remove(servicio);
    }

    // --- Categorías (1 a 3 por servicio potencial) ---

    async findCategoriasByServicioId(servicioId: string): Promise<CategoriaEntity[]> {
        const servicio: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({
            where: { id: servicioId },
            relations: { categorias: { categoria: true } }
        });
        if (!servicio)
            throw new BusinessLogicException("The servicio potencial with the given id was not found", BusinessError.NOT_FOUND);

        return servicio.categorias.map(c => c.categoria);
    }

    async associateCategoriasServicio(servicioId: string, categoriaIds: string[]): Promise<ServicioPotencialEntity> {
        const servicio: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({ where: { id: servicioId } });
        if (!servicio)
            throw new BusinessLogicException("The servicio potencial with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        await this.servicioCategoriaRepository.delete({ idServicioPotencial: servicioId });

        const relaciones = categoriaIds.map(idCategoria =>
            this.servicioCategoriaRepository.create({ idServicioPotencial: servicioId, idCategoria })
        );
        await this.servicioCategoriaRepository.save(relaciones);

        const servicioActualizado: ServicioPotencialEntity | null = await this.servicioPotencialRepository.findOne({
            where: { id: servicioId },
            relations: { categorias: true }
        });
        return servicioActualizado as ServicioPotencialEntity;
    }

    private async validarCategorias(categoriaIds: string[]) {
        if (!categoriaIds || categoriaIds.length < 1 || categoriaIds.length > 3)
            throw new BusinessLogicException("A servicio potencial must have between 1 and 3 categorias", BusinessError.PRECONDITION_FAILED);

        for (const idCategoria of categoriaIds) {
            const categoria = await this.categoriaRepository.findOne({ where: { id: idCategoria } });
            if (!categoria)
                throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        }
    }
}