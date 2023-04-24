import { Test, TestingModule } from '@nestjs/testing';
import { PlanningPokerController } from './planning-poker.controller';

describe('PlanningPokerController', () => {
  let controller: PlanningPokerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningPokerController],
    }).compile();

    controller = module.get<PlanningPokerController>(PlanningPokerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
