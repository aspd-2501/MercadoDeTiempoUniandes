/* eslint-disable prettier/prettier */
/* archivo: src/solicitud-ayuda/solicitud-ayuda.dto.ts */
import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class SolicitudAyudaDto {
    @IsString()
    @IsNotEmpty()
    readonly titulo: string;

    @IsString()
    @IsNotEmpty()
    readonly descripcion: string;

    @IsDateString()
    @IsNotEmpty()
    readonly fechaCreacion: string;

    @IsNumber()
    @IsNotEmpty()
    readonly horas: number;

    @IsUUID()
    @IsNotEmpty()
    readonly perfilAutorId: string;

    // id del PerfilOrganizacion al que se envía la solicitud
    @IsUUID()
    @IsNotEmpty()
    readonly prestadorId: string;

    @IsUUID()
    @IsOptional()
    readonly servicioOfrecidoId?: string;
}