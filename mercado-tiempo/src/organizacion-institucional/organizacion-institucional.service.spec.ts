import { Test, TestingModule } from '@nestjs/testing';
import { OrganizacionInstitucionalService } from './organizacion-institucional.service';

describe('OrganizacionInstitucionalService', () => {
  let service: OrganizacionInstitucionalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrganizacionInstitucionalService],
    }).compile();

    service = module.get<OrganizacionInstitucionalService>(OrganizacionInstitucionalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
