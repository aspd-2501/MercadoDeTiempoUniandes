import { Test, TestingModule } from '@nestjs/testing';
import { PerfilMiembroService } from './perfil-miembro.service';

describe('PerfilMiembroService', () => {
  let service: PerfilMiembroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfilMiembroService],
    }).compile();

    service = module.get<PerfilMiembroService>(PerfilMiembroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
