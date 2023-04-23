import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, HttpCode, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiNoContentResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminOnly } from '../auth/decorator/admin-only.decorator';
import { CreateProjectDto, CreateProjectSchema } from './dto/create-project.dto';
import { hasNewProjectDevelopers, hasNewProjectProjectOwner, hasNewProjectScrumMaster } from './dto/create-project-user-role.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { Token } from '../auth/decorator/token.decorator';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ProjectUserRole, UserRole } from './project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { AdminOnlyGuard } from '../auth/guard/admin-only.guard';
import { UserService } from '../user/user.service';
import { TokenDto, tokenSchema } from '../auth/dto/token.dto';
import { UpdateProjectSchema, UpdateProjectDto } from './dto/update-project.dto';
import { UpdateSuperiorUser, UpdateSuperiorUserSchema } from './dto/edit-user-role.dto';
import { ProjectDto } from './dto/project.dto';
import { ProjectWallNotification } from '../project-wall-notification/project-wall-notification.entity';
import { ProjectWallNotificationService } from '../project-wall-notification/project-wall-notification.service';
import { CreateProjectWallNotificationDto, CreateProjectWallNotificationSchema } from '../project-wall-notification/dto/create-notification.dto';
import { ProjectWallNotificationDto } from '../project-wall-notification/dto/project-wall-notification.dto';
import { ProjectWallNotificationCommentService } from '../project-wall-notification-comment/project-wall-notification-comment.service';
import { CreateProjectWallNotificationCommentSchema, CreateProjectWallNotificationCommentDto } from '../project-wall-notification-comment/dto/create-notification-comment.dto';

@ApiTags('project')
// @ApiBearerAuth()
// @ApiUnauthorizedResponse()
// @UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
    private readonly projectWallNotificationService: ProjectWallNotificationService,
    private readonly projectWallNotificationCommentService: ProjectWallNotificationCommentService,
  ) { }

  @ApiOperation({ summary: 'List projects.' })
  @ApiOkResponse()
  @Get()
  async listProjects(): Promise<Project[]> {
    return await this.projectService.getAllProjects();
  }

  @ApiOperation({ summary: 'List projects with user data.' })
  @ApiOkResponse()
  @Get('/with-data')
  async listProjectsAndUserData(): Promise<ProjectDto[]> {
    return await this.projectService.getAllProjectsWithUserData();
  }

  @ApiOperation({ summary: 'Get the active project.' })
  @ApiOkResponse()
  @Get('/active')
  async getActiveProject(): Promise<Project> {
    return await this.projectService.getActiveProject();
  }

  @ApiOperation({ summary: 'List wall notifications for all projects.' })
  @ApiOkResponse()
  @Get('/notifications')
  async listWalls(): Promise<ProjectWallNotification[]> {
    const projectWallNotifications = await this.projectWallNotificationService.getAll();
    if (!projectWallNotifications)
      throw new NotFoundException('No project wall notifications.');
    return projectWallNotifications;
  }

  @ApiOperation({ summary: 'List wall notifications for single project.' })
  @ApiOkResponse()
  @Get(':projectId/notifications')
  async listProjectWallNotifications(@Param('projectId', ParseIntPipe) projectId: number): Promise<ProjectWallNotificationDto[]> {
    const projectWallNotifications = await this.projectWallNotificationService.getAllProjectWallNotificationsWithComments(projectId);
    if (!projectWallNotifications)
      throw new NotFoundException('No project wall notifications with this project ID.');
    return projectWallNotifications;
  }

  @ApiOperation({ summary: 'Get project by ID.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':projectId')
  async getProject(@Param('projectId', ParseIntPipe) projectId: number): Promise<Project> {
    const project = await this.projectService.getProjectById(projectId);
    if (!project)
      throw new NotFoundException('Project not found');
    return project;
  }

  @ApiOperation({ summary: 'Create project.' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @AdminOnly()
  @Post()
  async createProject(@Body(new JoiValidationPipe(CreateProjectSchema)) project: CreateProjectDto) {
    try {
      // Check if only one member is product owner and if this member does not have any other roles.
      if (!hasNewProjectProjectOwner(project.userRoles)) {
        throw new BadRequestException('There should only be one product owner, which cannot be anything else.');
      }

      // Check if there are all required roles.
      if (!hasNewProjectScrumMaster(project.userRoles) || !hasNewProjectDevelopers(project.userRoles)) {
        throw new BadRequestException('All roles must be included in the project, only one scrum master.');
      }

      // Check if user actually exist in the database.
      for (const userRole of project.userRoles) {
        const user = await this.userService.getUserById(userRole.userId);
        if (user == null)
          throw new NotFoundException(`One of users not found in the database.`);
      }
      const row = await this.projectService.createProject(project);
      const projectId = (<any>row).id;
      for (const userRole of project.userRoles)
        for (const role of userRole.role)
          await this.projectService.addUserToProject(projectId, userRole.userId, role);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Create project notification.' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':projectId/notification')
  async createProjectWallNotification(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Body(new JoiValidationPipe(CreateProjectWallNotificationSchema)) wallNotification: CreateProjectWallNotificationDto): Promise<number> {
    try {
      if (!await this.projectService.getProjectById(projectId))
        throw new BadRequestException('Project by the given ID does not exists.');

      if (!await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.Developer, UserRole.ScrumMaster, UserRole.ProjectOwner]))
        throw new ForbiddenException('User is not on this project, so he/she can not add a notification.');

      const row = await this.projectWallNotificationService.createNotification(wallNotification, projectId, 1);
      return (<any>row).id;
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Create project notification comment.' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':projectId/notification/:notificationId/comment')
  async createProjectWallNotificationComment(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Param('notificationId', ParseIntPipe) notificationId: number, @Body(new JoiValidationPipe(CreateProjectWallNotificationCommentSchema)) wallNotificationComment: CreateProjectWallNotificationCommentDto) {
    try {
      if (!await this.projectWallNotificationService.getProjectWallNotificationById(notificationId))
        throw new BadRequestException('Notification by the given ID does not exists.');

      if (!await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.Developer, UserRole.ScrumMaster, UserRole.ProjectOwner]))
        throw new ForbiddenException('User is not on this project, so he/she can not add a notification.');

      await this.projectWallNotificationCommentService.createNotificationComment(wallNotificationComment, notificationId, token.sid);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: "Update project name and description." })
  @ApiOkResponse()
  @Patch(':projectId')
  async updateProject(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Body(new JoiValidationPipe(UpdateProjectSchema)) project: UpdateProjectDto) {
    try {

      if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster)) {
        throw new ForbiddenException('User must be either an administrator or a scrum master to have any permission.');
      }

      let existingProject: Project = await this.projectService.getProjectById(projectId);
      if (!existingProject) {
        throw new NotFoundException('Project with the given ID not found.');
      }

      existingProject.projectName = project.projectName;
      existingProject.projectDescription = project.projectDescription == null ? existingProject.projectDescription : project.projectDescription;

      await this.projectService.updateProjectById(projectId, existingProject);
    }
    catch (ex) {
      if (ex instanceof ConflictException) {
        throw new ConflictException(ex.message);
      }
      else if (ex instanceof NotFoundException) {
        throw new NotFoundException(ex.message);
      }
      else {
        throw new BadRequestException(ex.message);
      }
    }
  }

  @ApiOperation({ summary: "Toggles the active flag for the project." })
  @ApiOkResponse()
  @Patch(':projectId/set-active')
  async setActiveProject(@Param('projectId', ParseIntPipe) projectId: number) {
    try {

      let existingProject: Project = await this.projectService.getProjectById(projectId);
      if (!existingProject) {
        throw new NotFoundException('Project with the given ID not found.');
      }
      if (existingProject.isActive)
        throw new BadRequestException('Project is already active.');

      let toggledActive: boolean = !existingProject.isActive;

      await this.projectService.setActiveProject(projectId, toggledActive);
    }
    catch (ex) {
      if (ex instanceof ConflictException) {
        throw new ConflictException(ex.message);
      }
      else if (ex instanceof NotFoundException) {
        throw new NotFoundException(ex.message);
      }
      else {
        throw new BadRequestException(ex.message);
      }
    }
  }

  @ApiOperation({ summary: 'Update the scrum master / product owner.' })
  @ApiOkResponse()
  @Patch(':projectId/change-user/role/:role')
  async changeProjectOwner(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Param('role', ParseIntPipe) role: number, @Body(new JoiValidationPipe(UpdateSuperiorUserSchema)) newUser: UpdateSuperiorUser) {
    if (!token.isAdmin) {
      throw new ForbiddenException('Only the administrator can change the project owner or the scrum master.');
    }

    if (role != UserRole.ScrumMaster && role != UserRole.ProjectOwner) {
      throw new BadRequestException('Only the scrum master and the product owner can be changed.');
    }

    await this.projectService.overwriteUserRoleOnProject(projectId, newUser.newUserId, role);
  }

  @ApiOperation({ summary: 'Delete project.' })
  @ApiOkResponse()
  @AdminOnly()
  @Delete(':projectId')
  async deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    await this.projectService.deleteProjectById(projectId);
  }

  @ApiOperation({ summary: 'List users with roles on the project.' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get(':projectId/user')
  async listUsersRolesOnProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<ProjectUserRole[]> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.isUserOnProject(projectId, token.sid))
      throw new ForbiddenException('Only the admin or the user on a project can view the project members.');
    return await this.projectService.listUsersWithRolesOnProject(projectId);
  }

  @ApiOperation({ summary: 'List users with role on the project.' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get(':projectId/user/role/:role')
  async listUsersWithRoleOnProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('role', ParseIntPipe) role: number,
  ): Promise<ProjectUserRole[]> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.isUserOnProject(projectId, token.sid))
      throw new ForbiddenException();
    return await this.projectService.listUsersWithRoleOnProject(projectId, role);
  }

  @ApiOperation({ summary: 'Add user to project.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @HttpCode(200)
  @Post(':projectId/developer/:userId')
  async addDeveloperToProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {

    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Only the administrator and the scrum master are allowed to add the developer.');

    // Get every user on the project and remove the project owner.
    const allUsersOnProject: ProjectUserRole[] = (await this.projectService.listUsersWithRolesOnProject(projectId));

    // Check if we would like to add the dev role to the product owner.
    if (allUsersOnProject.filter(po => po.role == UserRole.ProjectOwner && po.userId == userId).length == 1)
      throw new BadRequestException('Product owner cannot also be a developer.');

    // Check if Scrum master already has a developer role.
    const scrumMasterUserId: number = allUsersOnProject.filter(sc => sc.role == UserRole.ScrumMaster)[0].userId;

    // Get "all roles" with the current scrum master.
    const scrumMastersRoles = allUsersOnProject.filter(scrumMastersRoles => scrumMastersRoles.userId = scrumMasterUserId);

    if (scrumMastersRoles.length == 2 && scrumMasterUserId == userId) {
      throw new BadRequestException('The scrum master is already a developer.');
    }
    // Check if the target user already has the developer role.
    if (allUsersOnProject.filter(dev => dev.role == UserRole.Developer && dev.userId == userId).length == 1)
      throw new BadRequestException('The user is already a developer.');

    try {
      await this.projectService.addUserToProject(projectId, userId, UserRole.Developer);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Delete a single notification.' })
  @ApiNoContentResponse()
  @Delete(':projectId/notification/:notificationId')
  async deleteProjectWallNotification(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Param('notificationId', ParseIntPipe) notificationId: number) {
    if (!this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the scrum master on this project can delete notifications.');
    await this.projectWallNotificationService.deleteProjectWallNotification(notificationId);
  }

  @ApiOperation({ summary: 'Delete all notifications for a project.' })
  @ApiNoContentResponse()
  @Delete(':projectId/notifications')
  async deleteProjectWallNotifications(@Token() token, @Param('projectId', ParseIntPipe) projectId: number) {
    if (!this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the scrum master on this project can delete notifications.');
    await this.projectWallNotificationService.deleteProjectWallNotificationByProjectId(projectId);
  }

  @ApiOperation({ summary: 'Delete a single notification comment.' })
  @ApiNoContentResponse()
  @Delete(':projectId/notification-comments/:commentId')
  async deleteProjectWallNotificationComment(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Param('commentId', ParseIntPipe) commentId: number) {
    if (!this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the scrum master on this project can delete notifications.');
    await this.projectWallNotificationCommentService.deleteProjectWallNotificationComment(commentId);
  }

  @ApiOperation({ summary: 'Remove developer from project.' })
  @ApiOkResponse()
  @Delete(':projectId/developer/:userId')
  async removeDeveloperFromProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {

    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Only the administrator and the scrum master are allowed to remove the developer.');

    let developers: ProjectUserRole[] = await this.projectService.listUsersWithRoleOnProject(projectId, UserRole.Developer);

    // Check if developer count in the project. 
    if (developers.length == 1)
      throw new BadRequestException('You cannot remove the only developer on a project.');

    if (developers.filter(dev => dev.userId == userId).length == 0)
      throw new BadRequestException('The user is not developer. Try again with a new user.');

    await this.projectService.removeRoleFromUserOnProject(projectId, userId, UserRole.Developer);
  }
}
