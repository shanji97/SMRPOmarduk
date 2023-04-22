import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoryNotification } from './story-notification.entity';
import { StoryNotificationService } from './story-notification.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            StoryNotification,
        ]),
    ],
    providers: [
        StoryNotificationService,
    ],
    exports: [
        StoryNotificationService
    ]
})
export class StoryNotificationModule { }
