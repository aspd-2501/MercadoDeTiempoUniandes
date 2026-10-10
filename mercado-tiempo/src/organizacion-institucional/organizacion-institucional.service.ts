/* eslint-disable prettier/prettier */
/* archivo: src/organizacion-institucional/organizacion-institucional.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { OrganizacionInstitucionalEntity } from './organizacion-institucional.entity';

@Injectable()
export class OrganizacionInstitucionalService {
    constructor(
        @InjectRepository(OrganizacionInstitucionalEntity)
        private readonly organizacionRepository: Repository<OrganizacionInstitucionalEntity>
    ) {}

    async findAll(): Promise<OrganizacionInstitucionalEntity[]> {
        return await this.organizacionRepository.find({ relations: { actividades: true } });
    }

    async findOne(id: string): Promise<OrganizacionInstitucionalEntity> {
        const organizacion: OrganizacionInstitucionalEntity | null = await this.organizacionRepository.findOne({
            where: { id },
            relations: { actividades: true }
        });
        if (!organizacion)
            throw new BusinessLogicException("The organizacion institucional with the given id was not found", BusinessError.NOT_FOUND);
        return organizacion;
    }

    async create(organizacion: OrganizacionInstitucionalEntity): Promise<OrganizacionInstitucionalEntity> {
        return await this.organizacionRepository.save(organizacion);
    }

    async update(id: string, organizacion: OrganizacionInstitucionalEntity): Promise<OrganizacionInstitucionalEntity> {
        const persisted: OrganizacionInstitucionalEntity | null = await this.organizacionRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The organizacion institucional with the given id was not found", BusinessError.NOT_FOUND);
        organizacion.id = id;
        return await this.organizacionRepository.save(organizacion);
    }

    async delete(id: string) {
        const organizacion: OrganizacionInstitucionalEntity | null = await this.organizacionRepository.findOne({ where: { id } });
        if (!organizacion)
            throw new BusinessLogicException("The organizacion institucional with the given id was not found", BusinessError.NOT_FOUND);
        await this.organizacionRepository.remove(organizacion);
    }
}