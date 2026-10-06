import { Test, TestingModule } from '@nestjs/testing';
import { DonacionService } from './donacion.service';

describe('DonacionService', () => {
  let service: DonacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DonacionService],
    }).compile();

    service = module.get<DonacionService>(DonacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
