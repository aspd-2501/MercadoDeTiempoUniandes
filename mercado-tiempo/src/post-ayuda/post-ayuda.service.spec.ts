import { Test, TestingModule } from '@nestjs/testing';
import { PostAyudaService } from './post-ayuda.service';

describe('PostAyudaService', () => {
  let service: PostAyudaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostAyudaService],
    }).compile();

    service = module.get<PostAyudaService>(PostAyudaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
