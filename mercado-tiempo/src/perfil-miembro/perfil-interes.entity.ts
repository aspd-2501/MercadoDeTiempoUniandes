/* eslint-disable prettier/prettier */
/* archivo: src/perfil-miembro/perfil-interes.entity.ts */
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { PerfilMiembroEntity } from './perfil-miembro.entity';
import { CategoriaEntity } from '../categoria/categoria.entity';

// --- Intereses del miembro: N:M entre PerfilMiembro y Categoria ---
@Entity()
export class PerfilInteresEntity {
    @PrimaryColumn()
    idPerfil: string;

    @PrimaryColumn()
    idCategoria: string;

    @ManyToOne(() => PerfilMiembroEntity, perfil => perfil.intereses, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idPerfil' })
    perfil: PerfilMiembroEntity;

    @ManyToOne(() => CategoriaEntity, categoria => categoria.perfilesInteresados, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'idCategoria' })
    categoria: CategoriaEntity;
}
