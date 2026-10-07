import { Test, TestingModule } from '@nestjs/testing';
import { PerfilOrganizacionService } from './perfil-organizacion.service';

describe('PerfilOrganizacionService', () => {
  let service: PerfilOrganizacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PerfilOrganizacionService],
    }).compile();

    service = module.get<PerfilOrganizacionService>(PerfilOrganizacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
