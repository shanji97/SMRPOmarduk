import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, QueryFailedError } from 'typeorm';

import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ProjectUserRole, UserRole } from './project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { User } from '../user/user.entity';
import { getRandomValues } from 'crypto';
import { hasNewProjectDevelopers } from './dto/create-project-user-role.dto';

@Injectable()
export class ProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async getAllProjects(): Promise<Project[]> {
    return await this.entityManager.find(Project);
  }

  async getProjectCount(): Promise<number> {
    return await this.entityManager.count(Project);
  }

  async getProjectById(projectId: number): Promise<Project> {
    return await this.entityManager.findOneBy(Project, { id: projectId });
  }

  async createProject(project: CreateProjectDto): Promise<object> {
    try {
      let newProject = this.createProjectObject(project);
      const inserted = await this.entityManager.insert(Project, newProject);
      return inserted.identifiers[0];
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ConflictException('Project with this name already exists! Please chose a new one.');
        }
      }
    }
  }

  async updateProjectById(projectId: number, project: DeepPartial<Project>) {
    try {
      await this.entityManager.update(Project, { id: projectId }, project);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Project name already exists');
        }
      }
    }
  }

  async deleteProjectById(projectId: number) {
    await this.entityManager.delete(Project, { id: projectId });
  }

  createProjectObject(project: CreateProjectDto): Project {
    let newProject = new Project();
    newProject.projectName = project.projectName;
    newProject.projectDescription = project.projectDescription;
    return newProject;
  }

  async listUsersWithRolesOnProject(projectId: number): Promise<ProjectUserRole[]> {
    return await this.entityManager.find(ProjectUserRole, {
      where: { projectId: projectId },
      relations: ['user'],
    });
  }

  async listUsersWithRoleOnProject(projectId: number, role: UserRole | number): Promise<ProjectUserRole[]> {
    return await this.entityManager.find(ProjectUserRole, {
      where: { projectId: projectId, role: role },
      relations: ['user'],
    });
  }

  async addUserToProject(projectId: number, userId: number, role: UserRole | number): Promise<void> {
    try {
      // Check: User can't be project owner if he already has any other role
      if (role === UserRole.ProjectOwner && await this.hasUserRoleOnProject(projectId, userId, null))
        throw new ValidationException('User already has some role and can\'t be also project owner.');

      // Check: User that is ProjectOwner can't be anything else
      if (role !== UserRole.ProjectOwner && await this.hasUserRoleOnProject(projectId, userId, UserRole.ProjectOwner))
        throw new ValidationException('User is project owner');

      await this.entityManager.insert(ProjectUserRole, {
        projectId: projectId,
        userId: userId,
        role: role,
      });
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('User already has same role on project');
        }
      }
      throw ex;
    }
  }

  async removeRoleFromUserOnProject(projectId: number, userId: number, role: UserRole | number): Promise<void> {
    await this.entityManager.delete(ProjectUserRole, {
      projectId: projectId,
      userId: userId,
      role: role,
    });
  }

  async overwriteUserRoleOnProject(projectId: number, userId: number, role: UserRole | number): Promise<void> {
    await this.entityManager.update(ProjectUserRole, { projectId, role: role }, { userId });
  }

  async removeUserFromProject(projectId: number, userId: number): Promise<void> {
    await this.entityManager.delete(ProjectUserRole, {
      projectId: projectId,
      userId: userId,
    });
  }

  async isUserOnProject(projectId: number, userId: number): Promise<boolean> {
    return await this.entityManager.countBy(ProjectUserRole, {
      projectId: projectId,
      userId: userId,
    }) > 0;
  }

  async hasUserRoleOnProject(projectId: number, userId: number, roles: UserRole[] | number[] | UserRole | number | null): Promise<boolean> {
    if (roles) {
      if (!Array.isArray(roles)) // Force an array
        roles = [roles];

      return await this.entityManager.countBy(ProjectUserRole, {
        projectId: projectId,
        userId: userId,
        role: In(roles),
      }) > 0;
    } else {
      return await this.entityManager.countBy(ProjectUserRole, {
        projectId: projectId,
        userId: userId,
      }) > 0;
    }
  }

  getRole(role: number): UserRole {
    const roleMap = {
      0: UserRole.Developer,
      1: UserRole.ScrumMaster,
      2: UserRole.ProjectOwner,
      default: null
    }
    return roleMap[role] || roleMap.default;
  }

}
