/* eslint-disable prettier/prettier */
/* archivo: src/acuerdo/acuerdo.service.ts */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business-errors';
import { AcuerdoEntity } from './acuerdo.entity';
import { ParticipanteAcuerdoEntity, RolParticipante } from './participante-acuerdo.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';

@Injectable()
export class AcuerdoService {
    constructor(
        @InjectRepository(AcuerdoEntity)
        private readonly acuerdoRepository: Repository<AcuerdoEntity>,

        @InjectRepository(PerfilMiembroEntity)
        private readonly perfilMiembroRepository: Repository<PerfilMiembroEntity>,

        @InjectRepository(ParticipanteAcuerdoEntity)
        private readonly participanteRepository: Repository<ParticipanteAcuerdoEntity>
    ) {}

    // --- CRUD de Acuerdo ---

    async findAll(): Promise<AcuerdoEntity[]> {
        return await this.acuerdoRepository.find({
            relations: { postAyuda: true, solicitud: true, participantes: true, horario: true }
        });
    }

    async findOne(id: string): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id },
            relations: { postAyuda: true, solicitud: true, participantes: true, horario: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        return acuerdo;
    }

    async create(acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        return await this.acuerdoRepository.save(acuerdo);
    }

    async update(id: string, acuerdo: AcuerdoEntity): Promise<AcuerdoEntity> {
        const persisted: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id } });
        if (!persisted)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        acuerdo.id = id;
        return await this.acuerdoRepository.save(acuerdo);
    }

    async delete(id: string) {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({ where: { id } });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);
        await this.acuerdoRepository.remove(acuerdo);
    }

    // --- Relación con PerfilMiembro (vía ParticipanteAcuerdo, con rol) ---

    async addParticipanteAcuerdo(acuerdoId: string, perfilId: string, rol: RolParticipante): Promise<AcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        const yaParticipa = acuerdo.participantes.some(p => p.idPerfil === perfilId);
        if (yaParticipa)
            throw new BusinessLogicException("The perfil is already a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        const participante = this.participanteRepository.create({ idAcuerdo: acuerdoId, idPerfil: perfilId, rol });
        await this.participanteRepository.save(participante);

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async findParticipanteByAcuerdoIdPerfilId(acuerdoId: string, perfilId: string): Promise<ParticipanteAcuerdoEntity> {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        return participante;
    }

    async findParticipantesByAcuerdoId(acuerdoId: string): Promise<ParticipanteAcuerdoEntity[]> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: { perfil: true } }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        return acuerdo.participantes;
    }

    async associateParticipantesAcuerdo(
        acuerdoId: string,
        participantes: { perfilId: string; rol: RolParticipante }[]
    ): Promise<AcuerdoEntity> {
        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        for (const p of participantes) {
            const perfil = await this.perfilMiembroRepository.findOne({ where: { id: p.perfilId } });
            if (!perfil)
                throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);
        }

        await this.participanteRepository.delete({ idAcuerdo: acuerdoId });

        const nuevosParticipantes = participantes.map(p =>
            this.participanteRepository.create({ idAcuerdo: acuerdoId, idPerfil: p.perfilId, rol: p.rol })
        );
        await this.participanteRepository.save(nuevosParticipantes);

        const acuerdoActualizado: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        return acuerdoActualizado as AcuerdoEntity;
    }

    async deleteParticipanteAcuerdo(acuerdoId: string, perfilId: string) {
        const perfil: PerfilMiembroEntity | null = await this.perfilMiembroRepository.findOne({ where: { id: perfilId } });
        if (!perfil)
            throw new BusinessLogicException("The perfil with the given id was not found", BusinessError.NOT_FOUND);

        const acuerdo: AcuerdoEntity | null = await this.acuerdoRepository.findOne({
            where: { id: acuerdoId },
            relations: { participantes: true }
        });
        if (!acuerdo)
            throw new BusinessLogicException("The acuerdo with the given id was not found", BusinessError.NOT_FOUND);

        const participante = acuerdo.participantes.find(p => p.idPerfil === perfilId);
        if (!participante)
            throw new BusinessLogicException("The perfil with the given id is not a participant in the acuerdo", BusinessError.PRECONDITION_FAILED);

        await this.participanteRepository.delete({ idAcuerdo: acuerdoId, idPerfil: perfilId });
    }
}