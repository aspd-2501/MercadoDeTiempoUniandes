import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudAyudaService } from './solicitud-ayuda.service';

describe('SolicitudAyudaService', () => {
  let service: SolicitudAyudaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudAyudaService],
    }).compile();

    service = module.get<SolicitudAyudaService>(SolicitudAyudaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
