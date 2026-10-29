/* eslint-disable prettier/prettier */
/* archivo: src/transaccion/transaccion.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionService } from './transaccion.service';
import { TransaccionEntity } from './transaccion.entity';
import { PerfilMiembroEntity } from '../perfil-miembro/perfil-miembro.entity';
import { DepositoHorasEntity } from '../deposito-horas/deposito-horas.entity';
import { TransaccionController } from './transaccion.controller';

@Module({
    imports: [TypeOrmModule.forFeature([TransaccionEntity, PerfilMiembroEntity, DepositoHorasEntity])],
    providers: [TransaccionService],
    controllers: [TransaccionController],
})
export class TransaccionModule {}
