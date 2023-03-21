import { Test, TestingModule } from '@nestjs/testing';
import { CommonPasswordController } from './common-password.controller';

describe('CommonPasswordController', () => {
  let controller: CommonPasswordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommonPasswordController],
    }).compile();

    controller = module.get<CommonPasswordController>(CommonPasswordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
