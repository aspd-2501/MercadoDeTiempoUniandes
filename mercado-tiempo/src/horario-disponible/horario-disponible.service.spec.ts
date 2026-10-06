import { Test, TestingModule } from '@nestjs/testing';
import { HorarioDisponibleService } from './horario-disponible.service';

describe('HorarioDisponibleService', () => {
  let service: HorarioDisponibleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HorarioDisponibleService],
    }).compile();

    service = module.get<HorarioDisponibleService>(HorarioDisponibleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
