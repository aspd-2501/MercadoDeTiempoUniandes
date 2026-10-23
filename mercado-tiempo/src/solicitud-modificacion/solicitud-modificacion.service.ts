/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-modificacion/solicitud-modificacion.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { SolicitudModificacionEntity } from './solicitud-modificacion.entity';
import { AcuerdoEntity } from '../acuerdo/acuerdo.entity';
import { EstadoAcuerdo } from '../acuerdo/estado-acuerdo.enum';

@Injectable()
export class SolicitudModificacionService {
    constructor(
        @InjectRepository(SolicitudModificacionEntity)
        private readonly solicitudRepository: Repository<SolicitudModificacionEntity>,

        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>
    ) {}

    async findAllByAcuerdoId(acuerdoId: string): Promise<SolicitudModificacionEntity[]> {
        await this.findAcuerdo(acuerdoId);
        return await this.solicitudRepository.find({ where: { acuerdo: { id: acuerdoId } } });
    }

    async findOne(acuerdoId: string, id: string): Promise<SolicitudModificacionEntity> {
        await this.findAcuerdo(acuerdoId);
        const solicitud: SolicitudModificacionEntity | null = await this.solicitudRepository.findOne({
            where: { id, acuerdo: { id: acuerdoId } },
            relations: { acuerdo: true }
        });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud de modificacion with the given id was not found", BusinessError.NOT_FOUND);
        return solicitud;
    }

    // Crear una solicitud deja el acuerdo "en modificación" (estado 3)
    async create(acuerdoId: string, solicitud: SolicitudModificacionEntity): Promise<SolicitudModificacionEntity> {
        const acuerdo = await this.findAcuerdo(acuerdoId);

        if (acuerdo.estado === EstadoAcuerdo.REALIZADO)
            throw new BusinessLogicException("A realizado acuerdo cannot be modified", BusinessError.PRECONDITION_FAILED);

        if (solicitud.horas <= 0)
            throw new BusinessLogicException("The horas of a solicitud de modificacion must be positive", BusinessError.PRECONDITION_FAILED);

        solicitud.acuerdo = acuerdo;
        solicitud.estado = solicitud.estado ?? EstadoAcuerdo.EN_CREACION;
        const nueva = await this.solicitudRepository.save(solicitud);

        acuerdo.estado = EstadoAcuerdo.EN_MODIFICACION;
        await this.acuerdoRepository.save(acuerdo);

        return nueva;
    }

    async update(acuerdoId: string, id: string, solicitud: SolicitudModificacionEntity): Promise<SolicitudModificacionEntity> {
        const persisted = await this.findOne(acuerdoId, id);
        return await this.solicitudRepository.save({ ...persisted, ...solicitud, id, acuerdo: persisted.acuerdo });
    }

    // Aceptar aplica los cambios al acuerdo y lo deja "acordado" (estado 1)
    async aceptar(acuerdoId: string, id: string): Promise<AcuerdoEntity> {
        const solicitud = await this.findOne(acuerdoId, id);
        if (solicitud.estado === EstadoAcuerdo.ACORDADO)
            throw new BusinessLogicException("The solicitud de modificacion was already accepted", BusinessError.PRECONDITION_FAILED);

        const acuerdo = solicitud.acuerdo;
        acuerdo.horas = solicitud.horas;
        acuerdo.fechaRealizacion = solicitud.fechaRealizacion;
        acuerdo.estado = EstadoAcuerdo.ACORDADO;
        await this.acuerdoRepository.save(acuerdo);

        solicitud.estado = EstadoAcuerdo.ACORDADO;
        await this.solicitudRepository.save(solicitud);

        return acuerdo;
    }

    async delete(acuerdoId: string, id: string) {
        const solicitud = await this.findOne(acuerdoId, id);
        await this.solicitudRepository.remove(solicitud);
    }

    private async findAcuerdo(acuerdoId: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id: acuerdoId } });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        return acuerdo;
    }
}
