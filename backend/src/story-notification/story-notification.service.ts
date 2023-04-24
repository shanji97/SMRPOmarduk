import { ConflictException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, EntityManager, Not } from 'typeorm';
import { NotificationStatus, StoryNotification } from './story-notification.entity';

@Injectable()
export class StoryNotificationService {
    private readonly logger: Logger = new Logger(StoryNotificationService.name);

    constructor(
        @InjectRepository(StoryNotification)
        private readonly storyNotificationRepository: Repository<StoryNotification>,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAllNotifications(): Promise<StoryNotification[]> {
        return await this.storyNotificationRepository.find();
    }

    async getNotificationById(storyNotificationId: number): Promise<StoryNotification> {
        return await this.storyNotificationRepository.findOneBy({ id: storyNotificationId })
    }

    async getStoryNotificationsByStoryId(storyId: number, notificationType: NotificationStatus): Promise<StoryNotification[]> {
        return await this.storyNotificationRepository.findBy({ storyId: storyId, notificationType: notificationType });
    }

    async createNotification(description: string, userId: number, stroyId: number, notificationType: NotificationStatus, approved) {
        let newRejectionNotification: StoryNotification = this.createNotificationObject(description, userId, stroyId, notificationType, approved);
        await this.storyNotificationRepository.insert(newRejectionNotification);
    };

    async approveNotification(notificationId: number): Promise<void> {
        await this.entityManager.update(StoryNotification, { id: notificationId }, { approved: true });
    }

    async deleteNotification(notificationId: number): Promise<void> {
        await this.entityManager.delete(StoryNotification, { id: notificationId })
    }

    createNotificationObject(description: string, userId: number, storyId: number, notificationType: NotificationStatus, approved: boolean): StoryNotification {
        let newStoryNotification = new StoryNotification();
        newStoryNotification.notificationText = description;
        newStoryNotification.userId = userId;
        newStoryNotification.storyId = storyId;
        newStoryNotification.notificationType = notificationType;
        newStoryNotification.approved = approved;
        return newStoryNotification;
    }

}