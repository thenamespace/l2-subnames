import { Test, TestingModule } from '@nestjs/testing';
import { NameWrapperService } from './name-wrapper.service';

describe('NameWrapperService', () => {
  let service: NameWrapperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NameWrapperService],
    }).compile();

    service = module.get<NameWrapperService>(NameWrapperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
