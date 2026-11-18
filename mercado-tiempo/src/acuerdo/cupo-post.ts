/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/cupo-post.ts */
import { EntityManager, Not } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PostAyudaEntity } from '../post-ayuda/post-ayuda.entity';
import { ParticipanteAcuerdoEntity } from './participante-acuerdo.entity';
import { EstadoAcuerdo } from './estado-acuerdo.enum';

// --- Cupos de un post de ayuda ---
// `cupo` = cuántos miembros (además del autor) pueden tomar el post.
// Ocupan un cupo los miembros distintos del autor que participan en acuerdos no cancelados del post.
// `cupoLleno` ya no lo decide el cliente: se recalcula cada vez que cambian los participantes,
// así el post deja de salir en el feed y en la búsqueda cuando se llena, y vuelve a salir si se libera un cupo.

export interface OcupacionPost {
    post: PostAyudaEntity;
    ocupados: Set<string>;   // perfiles (sin el autor) que ya ocupan un cupo
}

// En Postgres bloquea la fila del post hasta que termine la transacción, para que dos miembros
// que se unen al mismo tiempo no tomen el último cupo los dos (SQLite, usado en las pruebas, no lo necesita).
export async function bloquearPost(manager: EntityManager, postId: string): Promise<void> {
    if (manager.connection.options.type === 'postgres')
        await manager.findOne(PostAyudaEntity, { where: { id: postId }, lock: { mode: 'pessimistic_write' } });
}

export async function ocupacionPost(manager: EntityManager, postId: string, excluirAcuerdoId?: string): Promise<OcupacionPost> {
    const post = await manager.findOne(PostAyudaEntity, { where: { id: postId }, relations: { perfilAutor: true } });
    if (!post)
        throw new BusinessLogicException("No se encontró el post de ayuda", BusinessError.NOT_FOUND);

    const participaciones = await manager.find(ParticipanteAcuerdoEntity, {
        where: { acuerdo: { postAyuda: { id: postId }, estado: Not(EstadoAcuerdo.CANCELADO) } },
        relations: { acuerdo: true },
    });

    const ocupados = new Set(participaciones
        .filter(p => p.idAcuerdo !== excluirAcuerdoId)
        .map(p => p.idPerfil)
        .filter(id => id !== post.perfilAutor?.id));
    return { post, ocupados };
}

// Revisa que los perfiles nuevos puedan tomar un cupo del post:
// nadie puede estar dos veces en acuerdos del mismo post y no se puede pasar del cupo.
export function validarCupo({ post, ocupados }: OcupacionPost, nuevos: string[]): void {
    const nuevosSinAutor = nuevos.filter(id => id !== post.perfilAutor?.id);
    if (nuevosSinAutor.some(id => ocupados.has(id)))
        throw new BusinessLogicException("El perfil ya participa en un acuerdo de este post", BusinessError.PRECONDITION_FAILED);
    if (ocupados.size + new Set(nuevosSinAutor).size > post.cupo)
        throw new BusinessLogicException("El post de ayuda ya no tiene cupos", BusinessError.PRECONDITION_FAILED);
}

// Deja `cupoLleno` como corresponde según los participantes actuales y lo devuelve
export async function recalcularCupoPost(manager: EntityManager, postId: string): Promise<boolean> {
    const { post, ocupados } = await ocupacionPost(manager, postId);
    const lleno = ocupados.size >= post.cupo;
    if (post.cupoLleno !== lleno)
        await manager.update(PostAyudaEntity, postId, { cupoLleno: lleno });
    return lleno;
}
