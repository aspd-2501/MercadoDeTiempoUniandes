import { Module } from '@nestjs/common';
import { CategoriaService } from './categoria.service';

@Module({
  providers: [CategoriaService]
})
export class CategoriaModule {}
