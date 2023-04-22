import { UserRole } from "../project-user-role.entity";

export class ProjectDto {
    id: number;
    projectName: string;
    projectDescription?: string | null;
    userRoles: { userId: number, role: UserRole[] }[];
    // wallNotifications:
  }
  