import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectModule } from '../project/project.module';
import { StoryModule } from '../story/story.module';
import { Task } from './task.entity';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Task,
    ]),
    ProjectModule,
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
