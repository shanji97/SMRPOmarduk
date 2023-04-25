import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectModule } from '../project/project.module';
import { SprintModule } from '../sprint/sprint.module';
import { StoryModule } from '../story/story.module';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskUserTime } from './task-user-time.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
      TaskUserTime,
    ]),
    ProjectModule,
    SprintModule,
    StoryModule,
  ],
  providers: [
    TaskService,
  ],
  controllers: [
    TaskController,
  ],
  exports: [
    TaskService,
  ]
})
export class TaskModule {}
