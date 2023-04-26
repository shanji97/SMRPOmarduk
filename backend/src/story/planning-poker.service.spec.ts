import { Test, TestingModule } from '@nestjs/testing';
import { PlanningPockerService } from './planning-poker.service';

describe('PlanningPockerService', () => {
  let service: PlanningPockerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanningPockerService],
    }).compile();

    service = module.get<PlanningPockerService>(PlanningPockerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
