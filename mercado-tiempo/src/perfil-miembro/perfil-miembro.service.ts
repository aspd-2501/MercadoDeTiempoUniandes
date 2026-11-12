/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-miembro.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { UsuarioEntity } from '../usuario/usuario.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';
import { PerfilInteresEntity } from './perfil-interes.entity';
import { ModeradorEntity } from '../moderador/moderador.entity';
import { TransaccionEntity } from '../transaccion/transaccion.entity';
import { TipoTransaccion } from '../transaccion/tipo-transaccion.enum';

// Horas con las que empieza todo perfil nuevo
export const SALDO_INICIAL = 3;

@Injectable()
export class PerfilMiembroService {
    constructor(
        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(UsuarioEntity)
        private readonly usuarioRepository: Repository<UsuarioEntity>,

        @InjectRepository(CategoriaEntity)
        private readonly categoriaRepository: Repository<CategoriaEntity>,

        @InjectRepository(PerfilInteresEntity)
        private readonly perfilInteresRepository: Repository<PerfilInteresEntity>,

        @InjectRepository(ModeradorEntity)
        private readonly moderadorRepository: Repository<ModeradorEntity>
    ) {}

    async findAll(): Promise<PerfilMiembroEntity[]> {
        return await this.perfilMiembroRepository.find();
    }

    async findOne(id: string): Promise<PerfilMiembroEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({
            where: { id },
            relations: { usuario: true }
        });
        if (!perfil)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);
        return perfil;
    }

    // Perfil de miembro de un usuario (el que se obtiene al iniciar sesión)
    async findByUsuarioId(usuarioId: string): Promise<PerfilMiembroEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({
            where: { usuario: { id: usuarioId } },
            relations: { usuario: true }
        });
        if (!perfil)
            throw new BusinessLogicException("The usuario with the given id does not have a perfil miembro", BusinessError.NOT_FOUND);
        return perfil;
    }

    async create(perfil: PerfilMiembroEntity): Promise<PerfilMiembroEntity> {
        if (!perfil.usuario)
            throw new BusinessLogicException("A perfil miembro must have a usuario", BusinessError.PRECONDITION_FAILED);

        const usuario: UsuarioEntity | null = await this.usuarioRepository.findOne({
            where: { id: perfil.usuario.id },
            relations: { perfil: true }
        });
        if (!usuario)
            throw new BusinessLogicException("The usuario with the given id was not found", BusinessError.NOT_FOUND);

        if (usuario.perfil)
            throw new BusinessLogicException("The usuario already has a perfil miembro", BusinessError.PRECONDITION_FAILED);

        // El saldo no lo elige el cliente: todos empiezan con SALDO_INICIAL
        perfil.saldo = SALDO_INICIAL;
        return await this.perfilMiembroRepository.save(perfil);
    }

    async update(id: string, perfil: PerfilMiembroEntity): Promise<PerfilMiembroEntity> {
        const persisted: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);
        perfil.id = id;
        // Editar el perfil nunca cambia el saldo (eso solo lo hace un moderador con ajustarSaldo)
        perfil.saldo = persisted.saldo;
        return await this.perfilMiembroRepository.save(perfil);
    }

    // --- Saldo: solo un moderador puede cambiarlo ---
    // Deja el saldo en el valor indicado y registra la diferencia como una Transaccion AJUSTE_MODERADOR.
    async ajustarSaldo(perfilId: string, saldo: number, usuarioModeradorId: string): Promise<PerfilMiembroEntity> {
        if (!Number.isInteger(saldo) || saldo < 0)
            throw new BusinessLogicException("The saldo must be an integer greater than or equal to 0", BusinessError.BAD_REQUEST);

        const moderador = await this.moderadorRepository.findOne({ where: { usuario: { id: usuarioModeradorId } } });
        if (!moderador)
            throw new BusinessLogicException("Only a moderador can change the saldo of a perfil miembro", BusinessError.FORBIDDEN);

        return await this.perfilMiembroRepository.manager.transaction(async manager => {
            const perfil = await manager.findOne(PerfilMiembroEntity, { where: { id: perfilId } });
            if (!perfil)
                throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);

            const diferencia = saldo - perfil.saldo;
            if (diferencia !== 0) {
                await manager.update(PerfilMiembroEntity, perfil.id, { saldo });
                await manager.save(TransaccionEntity, manager.create(TransaccionEntity, {
                    tipo: TipoTransaccion.AJUSTE_MODERADOR, horas: diferencia, saldoResultante: saldo, perfil: { id: perfil.id },
                }));
                perfil.saldo = saldo;
            }
            return perfil;
        });
    }

    async delete(id: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id } });
        if (!perfil)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);
        await this.perfilMiembroRepository.remove(perfil);
    }

    // --- Intereses (categorías, 0..*) ---

    async findInteresesByPerfilId(perfilId: string): Promise<CategoriaEntity[]> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({
            where: { id: perfilId },
            relations: { intereses: { categoria: true } }
        });
        if (!perfil)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);
        return perfil.intereses.map(i => i.categoria);
    }

    async associateInteresesPerfil(perfilId: string, categoriaIds: string[]): Promise<CategoriaEntity[]> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);

        const idsUnicos = [...new Set(categoriaIds ?? [])];
        for (const idCategoria of idsUnicos) {
            const categoria = await this.categoriaRepository.findOne({ where: { id: idCategoria } });
            if (!categoria)
                throw new BusinessLogicException("The categoria with the given id was not found", BusinessError.NOT_FOUND);
        }

        await this.perfilInteresRepository.delete({ idPerfil: perfilId });
        const relaciones = idsUnicos.map(idCategoria =>
            this.perfilInteresRepository.create({ idPerfil: perfilId, idCategoria })
        );
        await this.perfilInteresRepository.save(relaciones);

        return await this.findInteresesByPerfilId(perfilId);
    }

    async deleteInteresPerfil(perfilId: string, categoriaId: string) {
        const relacion = await this.perfilInteresRepository.findOne({ where: { idPerfil: perfilId, idCategoria: categoriaId } });
        if (!relacion)
            throw new BusinessLogicException("The categoria is not an interes of the perfil miembro", BusinessError.PRECONDITION_FAILED);
        await this.perfilInteresRepository.remove(relacion);
    }

    // --- Estado de actividad (RF-006) ---
    // Un miembro inactivo no aparece en la búsqueda de miembros y sus publicaciones no salen en el feed.

    async cambiarEstadoActividad(perfilId: string, activo: boolean): Promise<PerfilMiembroEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil miembro with the given id was not found", BusinessError.NOT_FOUND);

        await this.perfilMiembroRepository.update(perfilId, { estadoActividad: activo });
        return await this.findOne(perfilId);
    }
}
