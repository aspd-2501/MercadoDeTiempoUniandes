/* eslint-disable prettier/prettier */
/* archivo: src/perfil-organizacion/perfil-organizacion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PerfilOrganizacionEntity } from './perfil-organizacion.entity';
import { MiembroOrganizacionEntity } from './miembro-organizacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class PerfilOrganizacionService {
    constructor(
        @InjectRepository(PerfilOrganizacionEntity)
        private readonly perfilOrganizacionRepository: Repository<PerfilOrganizacionEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(MiembroOrganizacionEntity)
        private readonly miembroRepository: Repository<MiembroOrganizacionEntity>
    ) {}

    // --- CRUD de PerfilOrganizacion ---

    async findAll(): Promise<PerfilOrganizacionEntity[]> {
        return await this.perfilOrganizacionRepository.find({ relations: { perfil: true, miembros: true } });
    }

    async findOne(id: string): Promise<PerfilOrganizacionEntity> {
        const organizacion: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({
            where: { id },
            relations: { perfil: true, miembros: true }
        });
        if (!organizacion)
            throw new BusinessLogicException("No se encontró el perfil de organización", BusinessError.NOT_FOUND);
        return organizacion;
    }

    async create(organizacion: PerfilOrganizacionEntity): Promise<PerfilOrganizacionEntity> {
        if (!organizacion.perfil)
            throw new BusinessLogicException("Un perfil de organización debe tener un perfil", BusinessError.PRECONDITION_FAILED);

        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({
            where: { id: organizacion.perfil.id },
            relations: { perfilOrganizacion: true }
        });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        if (perfil.perfilOrganizacion)
            throw new BusinessLogicException("El perfil ya tiene un perfil de organización", BusinessError.PRECONDITION_FAILED);

        organizacion.numMiembros = 1;
        const nuevaOrganizacion = await this.perfilOrganizacionRepository.save(organizacion);

        const primerMiembro = this.miembroRepository.create({ idOrganizacion: nuevaOrganizacion.id, idPerfil: perfil.id });
        await this.miembroRepository.save(primerMiembro);

        return await this.findOne(nuevaOrganizacion.id);
    }

    async delete(id: string) {
        const organizacion: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({ where: { id } });
        if (!organizacion)
            throw new BusinessLogicException("No se encontró el perfil de organización", BusinessError.NOT_FOUND);
        await this.perfilOrganizacionRepository.remove(organizacion);
    }

    // --- Relación con PerfilMiembro (vía MiembroOrganizacion) ---

    async addMiembroOrganizacion(organizacionId: string, perfilId: string): Promise<PerfilOrganizacionEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        const organizacion: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({
            where: { id: organizacionId },
            relations: { miembros: true }
        });
        if (!organizacion)
            throw new BusinessLogicException("No se encontró el perfil de organización", BusinessError.NOT_FOUND);

        const yaEsMiembro = organizacion.miembros.some(m => m.idPerfil === perfilId);
        if (yaEsMiembro)
            throw new BusinessLogicException("El perfil ya es miembro de la organización", BusinessError.PRECONDITION_FAILED);

        const miembro = this.miembroRepository.create({ idOrganizacion: organizacionId, idPerfil: perfilId });
        await this.miembroRepository.save(miembro);

        organizacion.numMiembros = organizacion.miembros.length + 1;
        await this.perfilOrganizacionRepository.save({ id: organizacionId, numMiembros: organizacion.numMiembros });

        const organizacionActualizada: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({
            where: { id: organizacionId },
            relations: { miembros: true }
        });
        return organizacionActualizada as PerfilOrganizacionEntity;
    }

    async findMiembrosByOrganizacionId(organizacionId: string): Promise<PerfilMiembroEntity[]> {
        const organizacion: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({
            where: { id: organizacionId },
            relations: { miembros: { perfil: true } }
        });
        if (!organizacion)
            throw new BusinessLogicException("No se encontró el perfil de organización", BusinessError.NOT_FOUND);

        return organizacion.miembros.map(m => m.perfil);
    }

    async deleteMiembroOrganizacion(organizacionId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        const organizacion: PerfilOrganizacionEntity | null = await this.perfilOrganizacionRepository.findOne({
            where: { id: organizacionId },
            relations: { miembros: true }
        });
        if (!organizacion)
            throw new BusinessLogicException("No se encontró el perfil de organización", BusinessError.NOT_FOUND);

        const miembro = organizacion.miembros.find(m => m.idPerfil === perfilId);
        if (!miembro)
            throw new BusinessLogicException("El perfil no es miembro de la organización", BusinessError.PRECONDITION_FAILED);

        if (organizacion.miembros.length <= 1)
            throw new BusinessLogicException("Un perfil de organización debe conservar al menos 1 miembro", BusinessError.PRECONDITION_FAILED);
        
        await this.miembroRepository.delete({ idOrganizacion: organizacionId, idPerfil: perfilId });

        await this.perfilOrganizacionRepository.save({ id: organizacionId, numMiembros: organizacion.miembros.length - 1 });
    }
}