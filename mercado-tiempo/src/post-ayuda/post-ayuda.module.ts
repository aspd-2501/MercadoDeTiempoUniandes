import { Module } from '@nestjs/common';
import { PostAyudaService } from './post-ayuda.service';

@Module({
  providers: [PostAyudaService]
})
export class PostAyudaModule {}
