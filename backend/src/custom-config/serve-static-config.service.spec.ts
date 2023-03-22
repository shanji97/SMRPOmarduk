import { Test, TestingModule } from '@nestjs/testing';
import { ServeStaticConfigService } from './serve-static-config.service';

describe('ServeStaticConfigService', () => {
  let service: ServeStaticConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServeStaticConfigService],
    }).compile();

    service = module.get<ServeStaticConfigService>(ServeStaticConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
