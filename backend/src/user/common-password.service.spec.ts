import { Test, TestingModule } from '@nestjs/testing';
import { CommonPasswordService } from './common-password.service';

describe('CommonPasswordService', () => {
  let service: CommonPasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommonPasswordService],
    }).compile();

    service = module.get<CommonPasswordService>(CommonPasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
