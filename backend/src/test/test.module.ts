import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryTest } from './test.entity';
import { TestService } from './test.service';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      StoryTest
    ]),
  ],
  providers: [
   TestService,
  ],
  exports: [
    TestService,
  ]
})
export class TestModule {}
