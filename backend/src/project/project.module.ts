import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DocumentationModule } from './documentation/documentation.module';
import { Project } from './project.entity';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { ProjectUserRole } from './project-user-role.entity';
import { ProjectWallNotificationModule } from '../project-wall-notification/project-wall-notification.module';
import { ProjectWallNotificationCommentModule } from '../project-wall-notification-comment/project-wall-notification-comment.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      ProjectUserRole,
    ]),
    forwardRef(() => DocumentationModule),
    UserModule,
    ProjectWallNotificationModule,
    ProjectWallNotificationCommentModule
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
