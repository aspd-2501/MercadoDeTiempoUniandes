/* eslint-disable prettier/prettier */
/* archivo: src/servicio-ofrecido/crear-servicio-ofrecido.dto.ts */
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsUUID } from 'class-validator';
import { ServicioOfrecidoDto } from './servicio-ofrecido.dto';

export class CrearServicioOfrecidoDto extends ServicioOfrecidoDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    readonly categoriaIds: string[];
}