/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/servicio-ofrecido.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ServicioOfrecidoEntity } from './servicio-ofrecido.entity';
import { ServicioOfrecidoCategoriaEntity } from './servicio-ofrecido-categoria.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

@Injectable()
export class ServicioOfrecidoService {
    constructor(
        @InjectRepository(ServicioOfrecidoEntity)
        private readonly servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(CategoriaEntity)
        private readonly categoriaRepository: Repository<CategoriaEntity>,

        @InjectRepository(ServicioOfrecidoCategoriaEntity)
        private readonly servicioCategoriaRepository: Repository<ServicioOfrecidoCategoriaEntity>
    ) {}

    // --- CRUD de ServicioOfrecido ---

    async findAll(): Promise<ServicioOfrecidoEntity[]> {
        return await this.servicioOfrecidoRepository.find({
            relations: { perfil: true, categorias: true }
        });
    }

    async findOne(id: string): Promise<ServicioOfrecidoEntity> {
        const servicio: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({
            where: { id },
            relations: { perfil: true, categorias: true }
        });
        if (!servicio)
            throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);
        return servicio;
    }

    async create(servicio: ServicioOfrecidoEntity, categoriaIds: string[]): Promise<ServicioOfrecidoEntity> {
        if (!servicio.perfil)
            throw new BusinessLogicException("A servicio ofrecido must have a perfil", BusinessError.PRECONDITION_FAILED);
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: servicio.perfil.id } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        const nuevoServicio = await this.servicioOfrecidoRepository.save(servicio);

        const relaciones = categoriaIds.map(idCategoria =>
            this.servicioCategoriaRepository.create({ idServicio: nuevoServicio.id, idCategoria })
        );
        await this.servicioCategoriaRepository.save(relaciones);

        const servicioCompleto: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({
            where: { id: nuevoServicio.id },
            relations: { perfil: true, categorias: true }
        });
        return servicioCompleto as ServicioOfrecidoEntity;
    }

    async update(id: string, servicio: ServicioOfrecidoEntity): Promise<ServicioOfrecidoEntity> {
        const persisted: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);
        servicio.id = id;
        return await this.servicioOfrecidoRepository.save(servicio);
    }

    async delete(id: string) {
        const servicio: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({ where: { id } });
        if (!servicio)
            throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);
        await this.servicioOfrecidoRepository.remove(servicio);
    }

    // --- Categorías (1 a 3 por servicio) ---

    async findCategoriasByServicioId(servicioId: string): Promise<CategoriaEntity[]> {
        const servicio: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({
            where: { id: servicioId },
            relations: { categorias: { categoria: true } }
        });
        if (!servicio)
            throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);

        return servicio.categorias.map(c => c.categoria);
    }

    async associateCategoriasServicio(servicioId: string, categoriaIds: string[]): Promise<ServicioOfrecidoEntity> {
        const servicio: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({ where: { id: servicioId } });
        if (!servicio)
            throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);

        await this.validarCategorias(categoriaIds);

        await this.servicioCategoriaRepository.delete({ idServicio: servicioId });

        const relaciones = categoriaIds.map(idCategoria =>
            this.servicioCategoriaRepository.create({ idServicio: servicioId, idCategoria })
        );
        await this.servicioCategoriaRepository.save(relaciones);

        const servicioActualizado: ServicioOfrecidoEntity | null = await this.servicioOfrecidoRepository.findOne({
            where: { id: servicioId },
            relations: { categorias: true }
        });
        return servicioActualizado as ServicioOfrecidoEntity;
    }

    private async validarCategorias(categoriaIds: string[]) {
        if (!categoriaIds || categoriaIds.length < 1 || categoriaIds.length > 3)
            throw new BusinessLogicException("A servicio ofrecido must have between 1 and 3 categorias", BusinessError.PRECONDITION_FAILED);

        for (const idCategoria of categoriaIds) {
            const categoria = await this.categoriaRepository.findOne({ where: { id: idCategoria } });
            if (!categoria)
                throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        }
    }
}