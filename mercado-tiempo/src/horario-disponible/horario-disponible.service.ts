/* eslint-disable prettier/prettier */
/* archivo: src/horario-disponible/horario-disponible.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { HorarioDisponibleEntity } from './horario-disponible.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { SolicitudAyudaEntity } from '../solicitud-ayuda/solicitud-ayuda.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';

@Injectable()
export class HorarioDisponibleService {
    constructor(
        @InjectRepository(HorarioDisponibleEntity)
        private readonly horarioRepository: Repository<HorarioDisponibleEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(SolicitudAyudaEntity)
        private readonly solicitudRepository: Repository<SolicitudAyudaEntity>,

        @InjectRepository(PostAyudaEntity)
        private readonly postAyudaRepository: Repository<PostAyudaEntity>
    ) {}

    async findAll(): Promise<HorarioDisponibleEntity[]> {
        return await this.horarioRepository.find({
            relations: { acuerdo: true, solicitud: true, postAyuda: true, perfil: true }
        });
    }

    async findOne(id: string): Promise<HorarioDisponibleEntity> {
        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({
            where: { id },
            relations: { acuerdo: true, solicitud: true, postAyuda: true, perfil: true }
        });
        if (!horario)
            throw new BusinessLogicException("The horario disponible with the given id was not found", BusinessError.NOT_FOUND);
        return horario;
    }

    async create(horario: HorarioDisponibleEntity): Promise<HorarioDisponibleEntity> {
        if (!horario.perfil)
            throw new BusinessLogicException("A horario disponible must have a perfil", BusinessError.PRECONDITION_FAILED);
        const perfil = await this.perfilMiembroRepository.findOne({ where: { id: horario.perfil.id } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        if (horario.fechaFin <= horario.fechaInicio)
            throw new BusinessLogicException("fechaFin must be after fechaInicio", BusinessError.PRECONDITION_FAILED);

        await this.validarOrigen(horario);

        return await this.horarioRepository.save(horario);
    }

    async delete(id: string) {
        const horario: HorarioDisponibleEntity | null = await this.horarioRepository.findOne({ where: { id } });
        if (!horario)
            throw new BusinessLogicException("The horario disponible with the given id was not found", BusinessError.NOT_FOUND);
        await this.horarioRepository.remove(horario);
    }

    // --- Validación de origen único: acuerdo, solicitud o postAyuda (espejo del CHECK) ---

    private async validarOrigen(horario: HorarioDisponibleEntity) {
        const origenes = [
            { valor: horario.acuerdo, nombre: 'acuerdo' },
            { valor: horario.solicitud, nombre: 'solicitud' },
            { valor: horario.postAyuda, nombre: 'postAyuda' },
        ].filter(o => !!o.valor);

        if (origenes.length !== 1)
            throw new BusinessLogicException(
                "A horario disponible must have exactly one origen: an acuerdo, a solicitud or a postAyuda",
                BusinessError.PRECONDITION_FAILED
            );

        const [{ valor, nombre }] = origenes;

        if (nombre === 'acuerdo') {
            const acuerdo = await this.acuerdoRepository.findOne({ where: { id: valor.id } });
            if (!acuerdo)
                throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        } else if (nombre === 'solicitud') {
            const solicitud = await this.solicitudRepository.findOne({ where: { id: valor.id } });
            if (!solicitud)
                throw new BusinessLogicException("The solicitud with the given id was not found", BusinessError.NOT_FOUND);
        } else {
            const post = await this.postAyudaRepository.findOne({ where: { id: valor.id } });
            if (!post)
                throw new BusinessLogicException("The post ayuda with the given id was not found", BusinessError.NOT_FOUND);
        }
    }
}