import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Not, QueryFailedError } from 'typeorm';
import { ProjectWallNotificationComment } from './comment.entity';
import { CreateProjectWallNotificationCommentDto } from './dto/create-notification-comment.dto';

@Injectable()
export class ProjectWallNotificationCommentService {
    private readonly logger: Logger = new Logger(ProjectWallNotificationCommentService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAll(): Promise<ProjectWallNotificationComment[]> {
        return await this.entityManager.find(ProjectWallNotificationComment);
    }

    async createNotificationComment(projectWallNotification: CreateProjectWallNotificationCommentDto, notificationId: number, userId: number): Promise<void> {
        await this.entityManager.insert(ProjectWallNotificationComment, this.createProjectWallNotificationObject(projectWallNotification, notificationId, userId));
    }

    async getProjectWallNotificationById(projectWallNotificationCommentId: number): Promise<ProjectWallNotificationComment> {
        return await this.entityManager.findOneBy(ProjectWallNotificationComment, { id: projectWallNotificationCommentId });
    }

    async getProjectWallNotificationByProjectId(notificationId: number): Promise<ProjectWallNotificationComment[]> {
        return await this.entityManager.findBy(ProjectWallNotificationComment, { projectWallNotificationId: notificationId });
    }

    async deleteProjectWallNotificationComment(commentId: number) {
        return await this.entityManager.delete(ProjectWallNotificationComment, { id: commentId });
    }

    async deleteProjectWallNotificationByProjectId(notificationId: number) {
        return await this.entityManager.delete(ProjectWallNotificationComment, { projectWallNotificationId: notificationId });
    }

    createProjectWallNotificationObject(projectWallNotificationComment: CreateProjectWallNotificationCommentDto, NotificationId: number, userId): ProjectWallNotificationComment {
        let projectNotificationCommentObject = new ProjectWallNotificationComment();
        projectNotificationCommentObject.author = projectWallNotificationComment.author;
        projectNotificationCommentObject.content = projectWallNotificationComment.content;
        projectNotificationCommentObject.projectWallNotificationId = NotificationId
        projectNotificationCommentObject.userId = userId;
        return projectNotificationCommentObject;
    }
}
