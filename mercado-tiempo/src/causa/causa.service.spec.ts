import { Test, TestingModule } from '@nestjs/testing';
import { CausaService } from './causa.service';

describe('CausaService', () => {
  let service: CausaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CausaService],
    }).compile();

    service = module.get<CausaService>(CausaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
