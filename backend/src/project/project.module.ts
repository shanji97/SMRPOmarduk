import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MemberModule } from 'src/member/member.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Project,
    ]),
    MemberModule
  ],
  controllers: [
    ProjectController,
  ],
  providers: [
    ProjectService,
  ],
  exports: [
    ProjectService,
  ]
})
export class ProjectModule { }
