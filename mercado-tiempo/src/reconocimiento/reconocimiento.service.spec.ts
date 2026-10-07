import { Test, TestingModule } from '@nestjs/testing';
import { ReconocimientoService } from './reconocimiento.service';

describe('ReconocimientoService', () => {
  let service: ReconocimientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ReconocimientoService],
    }).compile();

    service = module.get<ReconocimientoService>(ReconocimientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
