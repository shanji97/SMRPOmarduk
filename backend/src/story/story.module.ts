import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './story.entity';
import { UserController } from './story.controller';
import { StoryService } from './story.service';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      User,
    ]),
  ],
  controllers: [
    UserController,
  ],
  providers: [
    StoryService,
  ],
  exports: [
    StoryService,
  ]
})
export class UserModule {}
