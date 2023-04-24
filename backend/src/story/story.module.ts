import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectModule } from '../project/project.module';
import { Story } from './story.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { TestModule } from '../test/test.module';
import { PlanningPokerService } from './planning-poker.service';
import { PlanningPokerController } from './planning-poker.controller';
import { PlanningPokerRound } from './planning-poker-round.entity';
import { PlanningPokerVote } from './planning-poker-vote.entity';

@Module({
 imports: [
    TypeOrmModule.forFeature([
      Story,
      PlanningPokerRound,
      PlanningPokerVote,
    ]),
    ProjectModule,
    TestModule,
  ],
  controllers: [
    StoryController,
    PlanningPokerController
  ],
  providers: [
    StoryService,
    PlanningPokerService,
  ],
  exports: [
    StoryService,
    PlanningPokerService,
  ]
})
export class StoryModule {}
