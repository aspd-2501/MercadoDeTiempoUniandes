import { Test, TestingModule } from '@nestjs/testing';
import { ServicioOfrecidoService } from './servicio-ofrecido.service';

describe('ServicioOfrecidoService', () => {
  let service: ServicioOfrecidoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicioOfrecidoService],
    }).compile();

    service = module.get<ServicioOfrecidoService>(ServicioOfrecidoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
