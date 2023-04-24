import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from '../project/project.module';
import { Story } from './story.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { TestModule } from '../test/test.module';
import { StoryNotificationModule } from '../story-notification/story-notification.module';

@Module({
 imports: [
    TypeOrmModule.forFeature([
      Story,
    ]),
    ProjectModule,
    TestModule,
    StoryNotificationModule,
  ],
  controllers: [
    StoryController
  ],
  providers: [
    StoryService,
  ],
  exports: [
    StoryService
  ]
})
export class StoryModule {}
