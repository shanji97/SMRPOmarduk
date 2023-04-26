import { ProjectWallNotificationCommentDto } from "../../project-wall-notification-comment/dto/project-wall-notification-comment.dto";

export class ProjectWallNotificationDto {
    id: number;
    author: string;
    title: string;
    projectId: number;
    userId: number;
    postContent?: string | null;
    created: string;
    comments: ProjectWallNotificationCommentDto[];
  }