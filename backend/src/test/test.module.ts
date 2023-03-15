import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Test } from './test.entity';
import { TestService } from './test.service';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Test,
    ]),
  ],
  providers: [
   TestService,
  ],
  exports: [
    TestService,
  ]
})
export class StoryModule {}
