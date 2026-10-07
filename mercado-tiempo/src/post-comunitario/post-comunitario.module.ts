import { Module } from '@nestjs/common';
import { PostComunitarioService } from './post-comunitario.service';

@Module({
  providers: [PostComunitarioService]
})
export class PostComunitarioModule {}
