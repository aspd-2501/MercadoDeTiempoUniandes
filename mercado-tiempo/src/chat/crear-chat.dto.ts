/* eslint-disable prettier/prettier */
/* archivo: src/chat/crear-chat.dto.ts */
import { ArrayNotEmpty, ArrayMinSize, IsUUID } from 'class-validator';

export class CrearChatDto {
    @IsUUID('4', { each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(2)
    readonly perfilIds: string[];
}