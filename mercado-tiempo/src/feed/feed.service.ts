/* eslint-disable prettier/prettier */
/* archivo: src/feed/feed.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { PostComunitarioEntity } from '../post-comunitario/post-comunitario.entity';
import { CausaEntity } from '../causa/causa.entity';
import { coincide, normalizar } from '../busqueda/texto-busqueda';

export type TipoPublicacion = 'POST_AYUDA' | 'POST_COMUNITARIO' | 'CAUSA';

// --- Una publicación del feed, con la misma forma para los tres tipos ---
export interface PublicacionFeed {
    tipo: TipoPublicacion;
    id: string;
    titulo: string;
    descripcion: string;
    imagen: string;
    fecha: Date;
    autor: { id: string; nombre: string; imagen: string } | null;
    categorias: string[];
    relevante: boolean;        // coincide con los intereses o los servicios del miembro (RF-021)
    ofrece?: boolean;          // solo posts de ayuda: true = ofrecimiento, false = solicitud
}

export interface PaginaFeed {
    publicaciones: PublicacionFeed[];
    pagina: number;
    tamano: number;
    hayMas: boolean;           // para el feed infinito (RF-020)
}

export interface FiltrosFeed {
    perfilId?: string;         // miembro que mira el feed: personaliza y oculta sus propias publicaciones
    categoria?: string;        // nombre de la categoría, por ejemplo "Académico"
    q?: string;                // palabras clave
    pagina?: number;           // empieza en 1
    tamano?: number;           // entre 1 y 50, por defecto 10
}

// --- Feed de publicaciones (RF-019, RF-020, RF-021) ---
//
// Mezcla posts de ayuda (sin cupo lleno), posts comunitarios públicos y causas.
// Primero van las publicaciones relevantes para el miembro y, dentro de cada grupo, las más nuevas.

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(PostAyudaEntity)
        private readonly postAyudaRepository: Repository<PostAyudaEntity>,

        @InjectRepository(PostComunitarioEntity)
        private readonly postComunitarioRepository: Repository<PostComunitarioEntity>,

        @InjectRepository(CausaEntity)
        private readonly causaRepository: Repository<CausaEntity>
    ) {}

    async findFeed(filtros: FiltrosFeed): Promise<PaginaFeed> {
        const pagina = filtros.pagina ?? 1;
        const tamano = filtros.tamano ?? 10;
        if (!Number.isInteger(pagina) || pagina < 1)
            throw new BusinessLogicException("The pagina must be an integer greater than 0", BusinessError.BAD_REQUEST);
        if (!Number.isInteger(tamano) || tamano < 1 || tamano > 50)
            throw new BusinessLogicException("The tamano must be an integer between 1 and 50", BusinessError.BAD_REQUEST);

        const categoriasDeInteres = filtros.perfilId ? await this.categoriasDeInteres(filtros.perfilId) : new Set<string>();

        const publicaciones = [
            ...(await this.postsAyuda()),
            ...(await this.postsComunitarios()),
            ...(await this.causas()),
        ]
            .filter(p => !filtros.perfilId || p.autor?.id !== filtros.perfilId)
            .filter(p => !filtros.categoria || p.categorias.some(c => normalizar(c) === normalizar(filtros.categoria)))
            .filter(p => coincide(filtros.q, [p.titulo, p.descripcion, ...p.categorias, p.autor?.nombre]))
            .map(p => ({ ...p, relevante: p.categorias.some(c => categoriasDeInteres.has(normalizar(c))) }))
            .sort((a, b) =>
                Number(b.relevante) - Number(a.relevante) ||
                new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
            );

        const inicio = (pagina - 1) * tamano;
        return {
            publicaciones: publicaciones.slice(inicio, inicio + tamano),
            pagina,
            tamano,
            hayMas: inicio + tamano < publicaciones.length,
        };
    }

    // Categorías de los intereses del miembro y de los servicios que ofrece
    private async categoriasDeInteres(perfilId: string): Promise<Set<string>> {
        const perfil = await this.perfilMiembroRepository.findOne({
            where: { id: perfilId },
            relations: {
                intereses: { categoria: true },
                serviciosOfrecidos: { categorias: { categoria: true } },
            }
        });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        return new Set([
            ...(perfil.intereses ?? []).map(i => i.categoria?.nombre),
            ...(perfil.serviciosOfrecidos ?? []).flatMap(s => (s.categorias ?? []).map(c => c.categoria?.nombre)),
        ].filter((n): n is string => !!n).map(normalizar));
    }

    private autor(perfil?: PerfilMiembroEntity | null) {
        return perfil ? { id: perfil.id, nombre: perfil.nombre, imagen: perfil.imagen } : null;
    }

    private async postsAyuda(): Promise<PublicacionFeed[]> {
        const posts = await this.postAyudaRepository.find({
            where: { cupoLleno: false },
            relations: { perfilAutor: true, categorias: { categoria: true } }
        });
        return posts.map(p => ({
            tipo: 'POST_AYUDA' as const,
            id: p.id,
            titulo: p.titulo,
            descripcion: p.descripcion,
            imagen: p.imagen,
            fecha: p.fechaCreacion,
            autor: this.autor(p.perfilAutor),
            categorias: (p.categorias ?? []).map(c => c.categoria?.nombre).filter((n): n is string => !!n),
            relevante: false,
            ofrece: p.ofrece,
        }));
    }

    private async postsComunitarios(): Promise<PublicacionFeed[]> {
        const posts = await this.postComunitarioRepository.find({
            where: { publico: true },
            relations: { creador: true }
        });
        return posts.map(p => ({
            tipo: 'POST_COMUNITARIO' as const,
            id: p.id,
            titulo: p.titulo,
            descripcion: p.descripcion,
            imagen: p.imagen,
            fecha: p.fechaCreacion,
            autor: this.autor(p.creador),
            categorias: [],
            relevante: false,
        }));
    }

    private async causas(): Promise<PublicacionFeed[]> {
        const causas = await this.causaRepository.find({ relations: { perfilCreador: true } });
        return causas.map(c => ({
            tipo: 'CAUSA' as const,
            id: c.id,
            titulo: c.nombre,
            descripcion: c.descripcion,
            imagen: c.imagen,
            fecha: c.fechaCreacion,
            autor: this.autor(c.perfilCreador),
            categorias: [],
            relevante: false,
        }));
    }
}
