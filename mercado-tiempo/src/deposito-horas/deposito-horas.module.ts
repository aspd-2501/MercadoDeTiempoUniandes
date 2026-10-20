/* eslint-disable prettier/prettier */
/* archivo: src/deposito-horas/deposito-horas.module.ts */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DepositoHorasService } from './deposito-horas.service';
import { DepositoHorasEntity } from './deposito-horas.entity';
import { DepositoHorasController } from './deposito-horas.controller';

@Module({
    imports: [TypeOrmModule.forFeature([DepositoHorasEntity])],
    providers: [DepositoHorasService],
    controllers: [DepositoHorasController],
})
export class DepositoHorasModule {}