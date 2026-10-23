/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { SolicitudAyudaEntity } from './solicitud-ayuda.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PerfilOrganizacionEntity } from '../perfil-organizacion/perfil-organizacion.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';

@Injectable()
export class SolicitudAyudaService {
    constructor(
        @InjectRepository(SolicitudAyudaEntity)
        private readonly solicitudRepository: Repository<SolicitudAyudaEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(PerfilOrganizacionEntity)
        private readonly perfilOrganizacionRepository: Repository<PerfilOrganizacionEntity>,

        @InjectRepository(ServicioOfrecidoEntity)
        private readonly servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>
    ) {}

    // --- CRUD de SolicitudAyuda ---

    async findAll(): Promise<SolicitudAyudaEntity[]> {
        return await this.solicitudRepository.find({
            relations: { perfilAutor: true, prestador: { perfil: true }, servicioOfrecido: true }
        });
    }

    async findOne(id: string): Promise<SolicitudAyudaEntity> {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({
            where: { id },
            relations: { perfilAutor: true, prestador: { perfil: true }, servicioOfrecido: true }
        });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);
        return solicitud;
    }

    async create(solicitud: SolicitudAyudaEntity): Promise<SolicitudAyudaEntity> {
        // Solicitante
        if (!solicitud.perfilAutor)
            throw new BusinessLogicException("A solicitud ayuda must have a perfil autor", BusinessError.PRECONDITION_FAILED);
        const autor = await this.perfilMiembroRepository.findOne({ where: { id: solicitud.perfilAutor.id } });
        if (!autor)
            throw new BusinessLogicException("The perfil autor with the given id was not found", BusinessError.NOT_FOUND);

        // Prestador: la organización a la que se envía la solicitud
        if (!solicitud.prestador)
            throw new BusinessLogicException("A solicitud ayuda must have a prestador", BusinessError.PRECONDITION_FAILED);
        const prestador = await this.perfilOrganizacionRepository.findOne({
            where: { id: solicitud.prestador.id },
            relations: { perfil: true }
        });
        if (!prestador)
            throw new BusinessLogicException("The perfil organizacion prestador with the given id was not found", BusinessError.NOT_FOUND);

        if (prestador.perfil?.id === autor.id)
            throw new BusinessLogicException("The perfil autor cannot be the prestador of its own solicitud", BusinessError.PRECONDITION_FAILED);

        // Servicio (opcional): debe ser uno de los que ofrece la organización
        if (solicitud.servicioOfrecido) {
            const servicio = await this.servicioOfrecidoRepository.findOne({
                where: { id: solicitud.servicioOfrecido.id },
                relations: { perfil: true }
            });
            if (!servicio)
                throw new BusinessLogicException("The servicio ofrecido with the given id was not found", BusinessError.NOT_FOUND);
            if (servicio.perfil?.id !== prestador.perfil?.id)
                throw new BusinessLogicException("The servicio ofrecido does not belong to the prestador", BusinessError.PRECONDITION_FAILED);
        }

        solicitud.aceptada = false;
        return await this.solicitudRepository.save(solicitud);
    }

    async update(id: string, solicitud: SolicitudAyudaEntity): Promise<SolicitudAyudaEntity> {
        const persisted: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({
            where: { id },
            relations: { perfilAutor: true, prestador: true }
        });
        if (!persisted)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);

        // El solicitante, el prestador y la aceptación no se cambian con update
        solicitud.id = id;
        solicitud.perfilAutor = persisted.perfilAutor;
        solicitud.prestador = persisted.prestador;
        solicitud.aceptada = persisted.aceptada;
        return await this.solicitudRepository.save(solicitud);
    }

    async delete(id: string) {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({ where: { id } });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);
        await this.solicitudRepository.remove(solicitud);
    }

    // --- Aceptar la solicitud (RF-027): la organización prestadora la acepta ---

    async aceptarSolicitud(id: string): Promise<SolicitudAyudaEntity> {
        const solicitud: SolicitudAyudaEntity | null = await this.solicitudRepository.findOne({ where: { id } });
        if (!solicitud)
            throw new BusinessLogicException("The solicitud ayuda with the given id was not found", BusinessError.NOT_FOUND);

        if (solicitud.aceptada)
            throw new BusinessLogicException("The solicitud ayuda is already aceptada", BusinessError.PRECONDITION_FAILED);

        solicitud.aceptada = true;
        await this.solicitudRepository.save(solicitud);
        return await this.findOne(id);
    }
}