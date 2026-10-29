/* eslint-disable prettier/prettier */
/* archivo: src/post-ayuda/crear-post-ayuda.dto.ts */
import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, ArrayNotEmpty, IsArray, IsUUID, ValidateNested } from 'class-validator';
import { PostAyudaDto } from './post-ayuda.dto';
import { FranjaHorariaDto } from './franja-horaria.dto';

export class CrearPostAyudaDto extends PostAyudaDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    @ArrayMaxSize(3)
    readonly categoriaIds: string[];

    // --- Franjas en las que el servicio podría realizarse (RF-036), mínimo 1 ---
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => FranjaHorariaDto)
    readonly horarios: FranjaHorariaDto[];
}