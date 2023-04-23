import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Not, QueryFailedError } from 'typeorm';
import { ProjectWallNotification } from './project-wall-notification.entity';

@Injectable()
export class ProjectWallNotificationService {
    private readonly logger: Logger = new Logger(ProjectWallNotificationService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAll(): Promise<ProjectWallNotification[]> {
        return await this.entityManager.find(ProjectWallNotification);
    }

    async getProjectWallNotificationById(projectWallNotificationId: number): Promise<ProjectWallNotification> {
        return await this.entityManager.findOneBy(ProjectWallNotification, { id: projectWallNotificationId });
    }

    async getProjectWallNotificationByProjectId(projectId: number): Promise<ProjectWallNotification[]> {
        return await this.entityManager.findBy(ProjectWallNotification, { projectId: projectId });
    }

    async deleteProjectWallNotification(notificationId: number) {
        return await this.entityManager.delete(ProjectWallNotification, { id: notificationId });
    }

    async deleteProjectWallNotificationByProjectId(projectId: number) {
        return await this.entityManager.delete(ProjectWallNotification, { projectId: projectId });
    }
}
