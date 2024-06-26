import { Test, TestingModule } from '@nestjs/testing';
import { EnsRegistryService } from './ens-registry.service';

describe('EnsRegistryService', () => {
  let service: EnsRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EnsRegistryService],
    }).compile();

    service = module.get<EnsRegistryService>(EnsRegistryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
