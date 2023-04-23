import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectWallNotification } from './project-wall-notification.entity';
import { ProjectWallNotificationService } from './project-wall-notification.service';
import { ProjectWallNotificationCommentModule } from '../project-wall-notification-comment/project-wall-notification-comment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProjectWallNotification
        ]),
        ProjectWallNotificationCommentModule
    ],
    providers: [
        ProjectWallNotificationService
    ],
    exports: [
        ProjectWallNotificationService
    ]
})
export class ProjectWallNotificationModule { }