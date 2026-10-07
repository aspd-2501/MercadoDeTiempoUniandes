import { Test, TestingModule } from '@nestjs/testing';
import { PostComunitarioService } from './post-comunitario.service';

describe('PostComunitarioService', () => {
  let service: PostComunitarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PostComunitarioService],
    }).compile();

    service = module.get<PostComunitarioService>(PostComunitarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
