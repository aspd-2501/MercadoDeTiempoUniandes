/* eslint-disable prettier/prettier */
/* archivo: src/actividad-comunitaria/actividad-comunitaria.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { ActividadComunitariaEntity } from './actividad-comunitaria.entity';
import { InscripcionActividadEntity } from './inscripcion-actividad.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class ActividadComunitariaService {
    constructor(
        @InjectRepository(ActividadComunitariaEntity)
        private readonly actividadComunitariaRepository: Repository<ActividadComunitariaEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(InscripcionActividadEntity)
        private readonly inscripcionRepository: Repository<InscripcionActividadEntity>
    ) {}

    // --- CRUD de ActividadComunitaria ---

    async findAll(): Promise<ActividadComunitariaEntity[]> {
        return await this.actividadComunitariaRepository.find({ relations: { organizacion: true, inscritos: true } });
    }

    async findOne(id: string): Promise<ActividadComunitariaEntity> {
        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id },
            relations: { organizacion: true, inscritos: true }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);
        return actividad;
    }

    async create(actividad: ActividadComunitariaEntity): Promise<ActividadComunitariaEntity> {
        return await this.actividadComunitariaRepository.save(actividad);
    }

    async update(id: string, actividad: ActividadComunitariaEntity): Promise<ActividadComunitariaEntity> {
        const persisted: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);
        actividad.id = id;
        return await this.actividadComunitariaRepository.save(actividad);
    }

    async delete(id: string) {
        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({ where: { id } });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);
        await this.actividadComunitariaRepository.remove(actividad);
    }

    // --- Relación con PerfilMiembro (vía InscripcionActividad) ---

    async addPerfilActividad(actividadId: string, perfilId: string): Promise<ActividadComunitariaEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);

        const yaInscrito = actividad.inscritos.some(i => i.idPerfil === perfilId);
        if (yaInscrito)
            throw new BusinessLogicException("The perfil is already enrolled in the actividad", BusinessError.PRECONDITION_FAILED);

        const inscripcion = this.inscripcionRepository.create({ idActividad: actividadId, idPerfil: perfilId });
        await this.inscripcionRepository.save(inscripcion);

        const actividadActualizada: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        return actividadActualizada as ActividadComunitariaEntity;
    }

    async findPerfilByActividadIdPerfilId(actividadId: string, perfilId: string): Promise<PerfilMiembroEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);

        const inscripcion = actividad.inscritos.find(i => i.idPerfil === perfilId);
        if (!inscripcion)
            throw new BusinessLogicException("The perfil with the given id is not enrolled in the actividad", BusinessError.PRECONDITION_FAILED);

        return perfil;
    }

    async findPerfilesByActividadId(actividadId: string): Promise<PerfilMiembroEntity[]> {
        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: { perfil: true } }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);

        return actividad.inscritos.map(i => i.perfil);
    }

    async associatePerfilesActividad(actividadId: string, perfiles: PerfilMiembroEntity[]): Promise<ActividadComunitariaEntity> {
        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);

        for (const p of perfiles) {
            const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: p.id } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
        }

        await this.inscripcionRepository.delete({ idActividad: actividadId });

        const nuevasInscripciones = perfiles.map(p =>
            this.inscripcionRepository.create({ idActividad: actividadId, idPerfil: p.id })
        );
        await this.inscripcionRepository.save(nuevasInscripciones);

        const actividadActualizada: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        return actividadActualizada as ActividadComunitariaEntity;
    }

    async deletePerfilActividad(actividadId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const actividad: ActividadComunitariaEntity | null = await this.actividadComunitariaRepository.findOne({
            where: { id: actividadId },
            relations: { inscritos: true }
        });
        if (!actividad)
            throw new BusinessLogicException("The actividad comunitaria with the given id was not found", BusinessError.NOT_FOUND);

        const inscripcion = actividad.inscritos.find(i => i.idPerfil === perfilId);
        if (!inscripcion)
            throw new BusinessLogicException("The perfil with the given id is not enrolled in the actividad", BusinessError.PRECONDITION_FAILED);

        await this.inscripcionRepository.delete({ idActividad: actividadId, idPerfil: perfilId });
    }
}