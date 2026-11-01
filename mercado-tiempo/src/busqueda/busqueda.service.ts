/* eslint-disable prettier/prettier */
/* archivo: src/busqueda/busqueda.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ServicioOfrecidoEntity } from '../servicio-ofrecido/servicio-ofrecido.entity';
import { coincide } from './texto-busqueda';

export enum TipoPostBusqueda {
    SOLICITUD = 'solicitud',          // posts que piden ayuda (ofrece = false)
    OFRECIMIENTO = 'ofrecimiento',    // posts que ofrecen ayuda (ofrece = true)
}

// --- Búsquedas de Explorar (RF-023, RF-024, RF-025) ---
// Ignoran tildes y mayúsculas. Si se escriben varias palabras, deben aparecer todas.

@Injectable()
export class BusquedaService {
    constructor(
        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(PostAyudaEntity)
        private readonly postAyudaRepository: Repository<PostAyudaEntity>,

        @InjectRepository(ServicioOfrecidoEntity)
        private readonly servicioOfrecidoRepository: Repository<ServicioOfrecidoEntity>
    ) {}

    // Miembros por nombre (RF-024) o por los servicios que ofrecen (RF-023),
    // también por descripción y afiliación. Solo cuentan los servicios visibles.
    async buscarMiembros(consulta?: string, excluirPerfilId?: string): Promise<PerfilMiembroEntity[]> {
        const perfiles = await this.perfilMiembroRepository.find({
            relations: { serviciosOfrecidos: { categorias: { categoria: true } } }
        });

        return perfiles
            .filter(p => p.id !== excluirPerfilId)
            .map(p => {
                p.serviciosOfrecidos = (p.serviciosOfrecidos ?? []).filter(s => s.visible);
                return p;
            })
            .filter(p => coincide(consulta, [
                p.nombre,
                p.descripcion,
                p.afiliacionUniandes,
                ...p.serviciosOfrecidos.flatMap(s => [
                    s.titulo,
                    s.descripcion,
                    ...(s.categorias ?? []).map(c => c.categoria?.nombre),
                ]),
            ]))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }

    // Posts de ayuda por palabra clave en título, descripción o categoría (RF-025), los más nuevos primero
    async buscarPostsAyuda(consulta?: string, tipo?: TipoPostBusqueda): Promise<PostAyudaEntity[]> {
        const posts = await this.postAyudaRepository.find({
            relations: { perfilAutor: true, categorias: { categoria: true }, horariosDisponibles: true }
        });

        return posts
            .filter(p => tipo !== TipoPostBusqueda.SOLICITUD || !p.ofrece)
            .filter(p => tipo !== TipoPostBusqueda.OFRECIMIENTO || p.ofrece)
            .filter(p => coincide(consulta, [
                p.titulo,
                p.descripcion,
                ...(p.categorias ?? []).map(c => c.categoria?.nombre),
            ]))
            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    }

    // Servicios visibles por palabra clave en título, descripción o categoría
    async buscarServicios(consulta?: string): Promise<ServicioOfrecidoEntity[]> {
        const servicios = await this.servicioOfrecidoRepository.find({
            where: { visible: true },
            relations: { perfil: true, categorias: { categoria: true } }
        });

        return servicios
            .filter(s => coincide(consulta, [
                s.titulo,
                s.descripcion,
                ...(s.categorias ?? []).map(c => c.categoria?.nombre),
            ]))
            .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    }
}
