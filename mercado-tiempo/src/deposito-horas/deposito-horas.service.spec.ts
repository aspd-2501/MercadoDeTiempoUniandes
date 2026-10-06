import { Test, TestingModule } from '@nestjs/testing';
import { DepositoHorasService } from './deposito-horas.service';

describe('DepositoHorasService', () => {
  let service: DepositoHorasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DepositoHorasService],
    }).compile();

    service = module.get<DepositoHorasService>(DepositoHorasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
