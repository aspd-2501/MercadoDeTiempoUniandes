import { Test, TestingModule } from '@nestjs/testing';
import { ActividadComunitariaService } from './actividad-comunitaria.service';

describe('ActividadComunitariaService', () => {
  let service: ActividadComunitariaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActividadComunitariaService],
    }).compile();

    service = module.get<ActividadComunitariaService>(ActividadComunitariaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
