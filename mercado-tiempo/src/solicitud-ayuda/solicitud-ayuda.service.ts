/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { SolicitudAyudaEntity } from './solicitud-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';

@Injectable()
export class SolicitudAyudaService {
    constructor(
        @InjectRepository(SolicitudAyudaEntity)
        private readonly solicitudRepository: Repository<SolicitudAyudaEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ServicioOfrecidoEntity)
        private readonly servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>
    ) {}

    // --- CRUD de SolicitudAyuda ---

    async findAll(): Promise<SolicitudAyudaEntity[]> {
        return await this.solicitudRepository.find({
            relations: { perfilAutor: true, perfilPrestador: true, servicioOfrecido: true }
        });
    }

    async findOne(id: string): Promise<SolicitudAyudaEntity> {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({
            where: { id },
            relations: { perfilAutor: true, perfilPrestador: true, servicioOfrecido: true }
        });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);
        return solicitud;
    }

    async create(solicitud: SolicitudAyudaEntity): Promise<SolicitudAyudaEntity> {
        if (!solicitud.perfilAutor)
            throw new BusinessLogicException("A solicitud ayuda must have a perfil autor", BusinessError.PRECONDITION_FAILED);
        const autor = await this.perfilMiembroRepository.findOne({ where: { id: solicitud.perfilAutor.id } });
        if (!autor)
            throw new BusinessLogicException("The perfil autor with the given id was not found", BusinessError.NOT_FOUND);

        if (solicitud.servicioOfrecido) {
            const servicio = await this.servicioOfrecidoRepository.findOne({ where: { id: solicitud.servicioOfrecido.id } });
            if (!servicio)
                throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);
        }

        solicitud.aceptada = false;
        solicitud.perfilPrestador = null as unknown as PerfilMiembroEntity;

        return await this.solicitudRepository.save(solicitud);
    }

    async update(id: string, solicitud: SolicitudAyudaEntity): Promise<SolicitudAyudaEntity> {
        const persisted: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);
        solicitud.id = id;
        return await this.solicitudRepository.save(solicitud);
    }

    async delete(id: string) {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({ where: { id } });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);
        await this.solicitudRepository.remove(solicitud);
    }

    // --- Aceptar / tomar la solicitud (asignar prestador) ---

    async aceptarSolicitud(id: string, perfilPrestadorId: string): Promise<SolicitudAyudaEntity> {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({
            where: { id },
            relations: { perfilAutor: true }
        });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);

        if (solicitud.aceptada)
            throw new BusinessLogicException("The solicitud ayuda is already aceptada", BusinessError.PRECONDITION_FAILED);

        const prestador = await this.perfilMiembroRepository.findOne({ where: { id: perfilPrestadorId } });
        if (!prestador)
            throw new BusinessLogicException("The perfil prestador with the given id was not found", BusinessError.NOT_FOUND);

        if (perfilPrestadorId === solicitud.perfilAutor.id)
            throw new BusinessLogicException("The perfil autor cannot be the perfil prestador of its own solicitud", BusinessError.PRECONDITION_FAILED);

        solicitud.perfilPrestador = prestador;
        solicitud.aceptada = true;

        return await this.solicitudRepository.save(solicitud);
    }
}