import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Not, QueryFailedError } from 'typeorm';
import { ProjectWallNotificationComment } from './comment.entity';
import { CreateProjectWallNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class ProjectWallNotificationCommentService{
    private readonly logger: Logger = new Logger(ProjectWallNotificationCommentService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAll(): Promise<ProjectWallNotificationComment[]> {
        return await this.entityManager.find(ProjectWallNotificationComment);
    }

    async createNotification(projectWallNotification: CreateProjectWallNotificationDto, projectId: number, userId: number): Promise<void> {
        await this.entityManager.insert(ProjectWallNotificationComment , this.createProjectWallNotificationObject(projectWallNotification, projectId, userId));
    }

    async getProjectWallNotificationById(projectWallNotificationCommentId: number): Promise<ProjectWallNotificationComment > {
        return await this.entityManager.findOneBy(ProjectWallNotificationComment , { id: projectWallNotificationCommentId });
    }

    async getProjectWallNotificationByProjectId(notificationId: number): Promise<ProjectWallNotificationComment []> {
        return await this.entityManager.findBy(ProjectWallNotificationComment , { projectWallNotificationId: notificationId});
    }

    async deleteProjectWallNotification(comment: number) {
        return await this.entityManager.delete(ProjectWallNotificationComment , { id: comment });
    }

    async deleteProjectWallNotificationByProjectId(notificationId: number) {
        return await this.entityManager.delete(ProjectWallNotificationComment , { projectWallNotificationId: notificationId});
    }

    createProjectWallNotificationObject(projectWallNotification: CreateProjectWallNotificationDto, projectId: number, userId): ProjectWallNotificationComment {
        let projectNotificationCommentObject = new ProjectWallNotificationComment ();
        projectNotificationCommentObject.author = projectWallNotification.author;
        projectNotificationCommentObject.userId = userId;
        projectNotificationCommentObject.content = projectWallNotification.postContent;
        return projectNotificationCommentObject;
    }
}
