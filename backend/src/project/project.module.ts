import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { MemberModule } from 'src/member/member.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [

    TypeOrmModule.forFeature([
      Project,
    ]),
    MemberModule,
    UserModule
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
