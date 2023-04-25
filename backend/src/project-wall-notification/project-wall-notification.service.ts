import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Not, QueryFailedError } from 'typeorm';
import { ProjectWallNotification } from './project-wall-notification.entity';
import { CreateProjectWallNotificationDto } from './dto/create-notification.dto';
import { ProjectWallNotificationDto } from './dto/project-wall-notification.dto';

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

    async createNotification(projectWallNotification: CreateProjectWallNotificationDto, projectId: number, userId: number): Promise<any> {
        const inserted = await this.entityManager.insert(ProjectWallNotification, this.createProjectWallNotificationObject(projectWallNotification, projectId, userId));
        return inserted.identifiers[0];
    }

    async getProjectWallNotificationById(projectWallNotificationId: number): Promise<ProjectWallNotification> {
        return await this.entityManager.findOneBy(ProjectWallNotification, { id: projectWallNotificationId });
    }

    async getProjectWallNotificationByProjectId(projectId: number): Promise<ProjectWallNotification[]> {
        return await this.entityManager.findBy(ProjectWallNotification, { projectId: projectId });
    }

    async getAllProjectWallNotificationsWithComments(projectId: number): Promise<ProjectWallNotificationDto[]> {
        return await this.entityManager.createQueryBuilder(ProjectWallNotification, 'notification')
            .leftJoinAndSelect('notification.comments', 'comment')
            .leftJoinAndSelect('comment.user', 'commentUser')
            .where('notification.projectId = :projectId', { projectId })
            .orderBy('notification.created', 'DESC')
            .addOrderBy('comment.created', 'ASC')
            .getMany();
    }

    async deleteProjectWallNotification(notificationId: number) {
        return await this.entityManager.delete(ProjectWallNotification, { id: notificationId });
    }

    async deleteProjectWallNotificationByProjectId(projectId: number) {
        return await this.entityManager.delete(ProjectWallNotification, { projectId: projectId });
    }

    createProjectWallNotificationObject(projectWallNotification: CreateProjectWallNotificationDto, projectId: number, userId): ProjectWallNotification {
        let projectNotificationObject = new ProjectWallNotification();
        projectNotificationObject.title = projectWallNotification.title;
        projectNotificationObject.author = projectWallNotification.author;
        projectNotificationObject.postContent = projectWallNotification.postContent;
        projectNotificationObject.projectId = projectId;
        projectNotificationObject.userId = userId;
        return projectNotificationObject;
    }
}
