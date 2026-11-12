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

export interface AutorServicio {
    id: string;                          // id del perfil miembro
    nombre: string;
    imagen: string;
    esOrganizacion: boolean;
    perfilOrganizacionId: string | null; // para enviarle una solicitud de ayuda a la organización
}

// --- Un resultado de /buscar/servicios, con la misma forma para los dos tipos ---
export interface ResultadoServicio {
    tipo: 'POST_OFRECIMIENTO' | 'SERVICIO_ORGANIZACION';
    id: string;                          // id del post de ayuda o del servicio ofrecido, según el tipo
    titulo: string;
    descripcion: string;
    imagen: string | null;
    horas: number | null;                // solo los posts tienen horas
    categorias: string[];
    autor: AutorServicio | null;
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
    // también por descripción y afiliación. Solo cuentan los servicios visibles
    // y no aparecen los miembros inactivos (RF-006).
    async buscarMiembros(consulta?: string, excluirPerfilId?: string): Promise<PerfilMiembroEntity[]> {
        const perfiles = await this.perfilMiembroRepository.find({
            relations: { serviciosOfrecidos: { categorias: { categoria: true } } }
        });

        return perfiles
            .filter(p => p.id !== excluirPerfilId && p.estadoActividad)
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

    // Posts de ayuda por palabra clave en título, descripción o categoría (RF-025), los más nuevos primero.
    // No aparecen los posts de autores inactivos (RF-006) ni los que tienen el cupo lleno.
    async buscarPostsAyuda(consulta?: string, tipo?: TipoPostBusqueda): Promise<PostAyudaEntity[]> {
        const posts = await this.postAyudaRepository.find({
            where: { cupoLleno: false },
            relations: { perfilAutor: true, categorias: { categoria: true }, horariosDisponibles: true }
        });

        return posts
            .filter(p => p.perfilAutor?.estadoActividad !== false)
            .filter(p => tipo !== TipoPostBusqueda.SOLICITUD || !p.ofrece)
            .filter(p => tipo !== TipoPostBusqueda.OFRECIMIENTO || p.ofrece)
            .filter(p => coincide(consulta, [
                p.titulo,
                p.descripcion,
                ...(p.categorias ?? []).map(c => c.categoria?.nombre),
            ]))
            .sort((a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());
    }

    // Servicios que se pueden tomar (Explorar > Servicios): posts de ayuda que ofrecen algo
    // y servicios visibles de organizaciones. Los servicios de perfiles individuales no aparecen.
    // Busca por palabra clave en título, descripción o categoría. Sin autores inactivos (RF-006)
    // ni posts con el cupo lleno. Ordenados por título.
    async buscarServicios(consulta?: string): Promise<ResultadoServicio[]> {
        const posts = await this.postAyudaRepository.find({
            where: { ofrece: true, cupoLleno: false },
            relations: { perfilAutor: { perfilOrganizacion: true }, categorias: { categoria: true } }
        });

        const servicios = await this.servicioOfrecidoRepository.find({
            where: { visible: true },
            relations: { perfil: { perfilOrganizacion: true }, categorias: { categoria: true } }
        });

        const resultados: ResultadoServicio[] = [
            ...posts
                .filter(p => p.perfilAutor?.estadoActividad !== false)
                .map(p => ({
                    tipo: 'POST_OFRECIMIENTO' as const,
                    id: p.id,
                    titulo: p.titulo,
                    descripcion: p.descripcion,
                    imagen: p.imagen,
                    horas: p.horas,
                    categorias: (p.categorias ?? []).map(c => c.categoria?.nombre).filter((n): n is string => !!n),
                    autor: autorDe(p.perfilAutor),
                })),
            ...servicios
                .filter(s => !!s.perfil?.perfilOrganizacion && s.perfil.estadoActividad !== false)
                .map(s => ({
                    tipo: 'SERVICIO_ORGANIZACION' as const,
                    id: s.id,
                    titulo: s.titulo,
                    descripcion: s.descripcion,
                    imagen: s.imagen,
                    horas: null,
                    categorias: (s.categorias ?? []).map(c => c.categoria?.nombre).filter((n): n is string => !!n),
                    autor: autorDe(s.perfil),
                })),
        ];

        return resultados
            .filter(r => coincide(consulta, [r.titulo, r.descripcion, ...r.categorias]))
            .sort((a, b) => a.titulo.localeCompare(b.titulo, 'es'));
    }
}

function autorDe(perfil: PerfilMiembroEntity | null | undefined): AutorServicio | null {
    if (!perfil) return null;
    return {
        id: perfil.id,
        nombre: perfil.nombre,
        imagen: perfil.imagen,
        esOrganizacion: !!perfil.perfilOrganizacion,
        perfilOrganizacionId: perfil.perfilOrganizacion?.id ?? null,
    };
}
