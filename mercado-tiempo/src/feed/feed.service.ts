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

export const TIPOS_PUBLICACION: TipoPublicacion[] = ['POST_AYUDA', 'POST_COMUNITARIO', 'CAUSA'];

// Tipos que trae el feed si no se piden otros: las causas se piden explícitamente con `tipos`
export const TIPOS_POR_DEFECTO: TipoPublicacion[] = ['POST_AYUDA', 'POST_COMUNITARIO'];

// --- Una publicación del feed, con la misma forma para los tres tipos ---
export interface PublicacionFeed {
    tipo: TipoPublicacion;
    id: string;
    titulo: string;
    descripcion: string;
    imagen: string;
    fecha: Date;
    autor: { id: string; nombre: string; imagen: string; activo: boolean } | null;
    categorias: string[];
    relevante: boolean;        // coincide con los intereses o los servicios del miembro (RF-021)
    ofrece?: boolean;          // solo posts de ayuda: true = ofrecimiento, false = solicitud
    postAyuda?: PostAyudaEntity; // solo posts de ayuda: el post completo (horas, cupo, categorías, franjas),
                                 // para mostrarlo sin pedir cada post por separado
}

export interface PaginaFeed {
    publicaciones: PublicacionFeed[];
    pagina: number;
    tamano: number;
    hayMas: boolean;           // para el feed infinito (RF-020)
    siguienteCursor: string | null; // se envía como `despues` para pedir lo que sigue; null si no hay más
}

export interface FiltrosFeed {
    perfilId?: string;         // miembro que mira el feed: personaliza y oculta sus propias publicaciones
    categoria?: string;        // nombre de la categoría, por ejemplo "Académico"
    q?: string;                // palabras clave
    pagina?: number;           // empieza en 1 (se ignora si llega `despues`)
    despues?: string;          // cursor de la última publicación ya cargada (siguienteCursor de la página anterior)
    tamano?: number;           // entre 1 y 50, por defecto 10
    tipos?: TipoPublicacion[]; // qué incluir; por defecto posts de ayuda y posts comunitarios (sin causas)
}

// --- Feed de publicaciones (RF-019, RF-020, RF-021) ---
//
// Mezcla posts de ayuda (sin cupo lleno), posts comunitarios públicos y, si se piden, causas.
// No muestra publicaciones de miembros inactivos (RF-006).
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
            throw new BusinessLogicException("La página debe ser un número entero mayor que 0", BusinessError.BAD_REQUEST);
        if (!Number.isInteger(tamano) || tamano < 1 || tamano > 50)
            throw new BusinessLogicException("El tamaño debe ser un número entero entre 1 y 50", BusinessError.BAD_REQUEST);

        const tipos = filtros.tipos && filtros.tipos.length > 0 ? filtros.tipos : TIPOS_POR_DEFECTO;
        if (tipos.some(t => !TIPOS_PUBLICACION.includes(t)))
            throw new BusinessLogicException("Los tipos deben ser POST_AYUDA, POST_COMUNITARIO o CAUSA", BusinessError.BAD_REQUEST);

        const categoriasDeInteres = filtros.perfilId ? await this.categoriasDeInteres(filtros.perfilId) : new Set<string>();

        const publicaciones = [
            ...(tipos.includes('POST_AYUDA') ? await this.postsAyuda() : []),
            ...(tipos.includes('POST_COMUNITARIO') ? await this.postsComunitarios() : []),
            ...(tipos.includes('CAUSA') ? await this.causas() : []),
        ]
            .filter(p => !filtros.perfilId || p.autor?.id !== filtros.perfilId)
            .filter(p => p.autor?.activo !== false)
            .filter(p => !filtros.categoria || p.categorias.some(c => normalizar(c) === normalizar(filtros.categoria)))
            .filter(p => coincide(filtros.q, [p.titulo, p.descripcion, ...p.categorias, p.autor?.nombre]))
            .map(p => ({ ...p, relevante: p.categorias.some(c => categoriasDeInteres.has(normalizar(c))) }))
            .sort(compararPublicaciones);

        // Con cursor, la página empieza justo después de la última publicación que el miembro ya vio.
        // Así, si se publican cosas nuevas mientras baja por el feed, no se repiten ni se saltan publicaciones.
        let inicio: number;
        if (filtros.despues !== undefined) {
            const cursor = leerCursor(filtros.despues);
            inicio = publicaciones.findIndex(p => compararPublicaciones(p, cursor) > 0);
            if (inicio === -1) inicio = publicaciones.length;
        } else {
            inicio = (pagina - 1) * tamano;
        }

        const lote = publicaciones.slice(inicio, inicio + tamano);
        const hayMas = inicio + tamano < publicaciones.length;
        return {
            publicaciones: lote,
            pagina: filtros.despues !== undefined ? Math.floor(inicio / tamano) + 1 : pagina,
            tamano,
            hayMas,
            siguienteCursor: hayMas && lote.length > 0 ? crearCursor(lote[lote.length - 1]) : null,
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
            throw new BusinessLogicException("No se encontró el perfil", BusinessError.NOT_FOUND);

        return new Set([
            ...(perfil.intereses ?? []).map(i => i.categoria?.nombre),
            ...(perfil.serviciosOfrecidos ?? []).flatMap(s => (s.categorias ?? []).map(c => c.categoria?.nombre)),
        ].filter((n): n is string => !!n).map(normalizar));
    }

    private autor(perfil?: PerfilMiembroEntity | null) {
        return perfil ? { id: perfil.id, nombre: perfil.nombre, imagen: perfil.imagen, activo: perfil.estadoActividad } : null;
    }

    private async postsAyuda(): Promise<PublicacionFeed[]> {
        const posts = await this.postAyudaRepository.find({
            where: { cupoLleno: false },
            relations: { perfilAutor: true, categorias: { categoria: true }, horariosDisponibles: true }
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
            postAyuda: { ...p, horariosDisponibles: [...(p.horariosDisponibles ?? [])].sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime()) },
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

// --- Orden del feed y cursor ---
// Orden: primero las relevantes, luego las más nuevas; el tipo y el id desempatan para que el orden sea siempre el mismo.
interface PosicionFeed { relevante: boolean; fecha: Date | string | number; tipo: string; id: string }

function compararPublicaciones(a: PosicionFeed, b: PosicionFeed): number {
    return Number(b.relevante) - Number(a.relevante)
        || new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        || a.tipo.localeCompare(b.tipo)
        || a.id.localeCompare(b.id);
}

// El cursor es la posición de una publicación en ese orden, en base64url (el frontend lo trata como texto opaco)
function crearCursor(p: PublicacionFeed): string {
    const posicion = { r: p.relevante ? 1 : 0, f: new Date(p.fecha).getTime(), t: p.tipo, id: p.id };
    return Buffer.from(JSON.stringify(posicion)).toString('base64url');
}

function leerCursor(cursor: string): PosicionFeed {
    try {
        const { r, f, t, id } = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
        if ((r === 0 || r === 1) && Number.isFinite(f) && typeof t === 'string' && typeof id === 'string')
            return { relevante: r === 1, fecha: f, tipo: t, id };
    } catch { /* cursor inválido */ }
    throw new BusinessLogicException("El cursor del feed no es válido", BusinessError.BAD_REQUEST);
}
