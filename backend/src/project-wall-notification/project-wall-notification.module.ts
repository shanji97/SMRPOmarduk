import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectWallNotification } from './project-wall-notification.entity';
import { ProjectWallNotificationService } from './project-wall-notification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProjectWallNotification
        ]),
    ],
    providers: [
        ProjectWallNotificationService
    ],
    exports: [
        ProjectWallNotificationService
    ]
})
export class ProjectWallNotificationModule { }