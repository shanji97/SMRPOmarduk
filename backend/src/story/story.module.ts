import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Story } from './story.entity';
import { StoryController } from './story.controller';
import { StoryService } from './story.service';
import { TestModule } from 'src/test/test.module';

@Module({
 imports: [

    TypeOrmModule.forFeature([
      Story,
    ]),
    TestModule
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
