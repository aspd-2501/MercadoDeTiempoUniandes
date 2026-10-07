import { Test, TestingModule } from '@nestjs/testing';
import { ServicioPotencialService } from './servicio-potencial.service';

describe('ServicioPotencialService', () => {
  let service: ServicioPotencialService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicioPotencialService],
    }).compile();

    service = module.get<ServicioPotencialService>(ServicioPotencialService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
