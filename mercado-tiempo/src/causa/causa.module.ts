import { Module } from '@nestjs/common';
import { CausaService } from './causa.service';

@Module({
  providers: [CausaService]
})
export class CausaModule {}
