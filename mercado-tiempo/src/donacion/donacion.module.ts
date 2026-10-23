/* eslint-disable prettier/prettier */
/* archivo: src/donacion/donacion.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonacionService } from './donacion.service';
import { DonacionEntity } from './donacion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { CausaEntity } from '../causa/causa.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { DonacionController } from './donacion.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DonacionEntity, PerfilMiembroEntity, DepositoHorasEntity, CausaEntity])],
    providers: [DonacionService],
    controllers: [DonacionController],
})
export class DonacionModule {}