import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectWallNotificationComment } from './comment.entity';
import { ProjectWallNotificationCommentService } from './project-wall-notification-comment.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProjectWallNotificationComment
        ]),
    ],
    providers: [
        ProjectWallNotificationCommentService
    ],
    exports: [
        ProjectWallNotificationCommentService
    ]
})
export class ProjectWallNotificationCommentModule { }