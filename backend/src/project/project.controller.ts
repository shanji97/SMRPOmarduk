import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, HttpCode, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
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
import { TokenDto } from '../auth/dto/token.dto';
import { throwError } from 'rxjs';

@ApiTags('project')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly userService: UserService,
  ) { }

  @ApiOperation({ summary: 'List projects' })
  @ApiOkResponse()
  @Get()
  async listProjects(): Promise<Project[]> {
    return await this.projectService.getAllProjects();
  }

  @ApiOperation({ summary: 'Get project by ID' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':projectId')
  async getProject(@Param('projectId', ParseIntPipe) projectId: number): Promise<Project> {
    const project = await this.projectService.getProjectById(projectId);
    if (!project)
      throw new NotFoundException('Project not found');
    return project;
  }

  @ApiOperation({ summary: 'Create project' })
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

  @ApiOperation({ summary: 'Delete project' })
  @ApiOkResponse()
  @AdminOnly()
  @Delete(':projectId')
  async deleteProject(@Param('projectId', ParseIntPipe) projectId: number) {
    await this.projectService.deleteProjectById(projectId);
  }


  @ApiOperation({ summary: 'List users with roles on the project ' })
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

  @ApiOperation({ summary: 'List users with role on the project' })
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

  @ApiOperation({ summary: 'Add user to project' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @HttpCode(200)
  @Post(':projectId/addDeveloper/:userId')
  async addUserToProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Only the administrator and the scrum master are allowed to add the developer.');

    // Get every user on the project and remove the project owner.
    let allUsersOnProject: ProjectUserRole[] = (await this.projectService.listUsersWithRolesOnProject(projectId)).filter(u => u.role != UserRole.ProjectOwner);

    // Check if scrum master is also a developer.
    let scrumMaster: ProjectUserRole[] = allUsersOnProject.filter(sm => sm.role < UserRole.ProjectOwner);
    // If yes set up a flag
    let isScrumMasterAndDeveloper: Boolean = scrumMaster.length == 2;

    // Check if the passed user id corresponds with the id passed in
    if (isScrumMasterAndDeveloper && scrumMaster.filter(smd => smd.userId == userId).length == 1)
      throw new BadRequestException('The scrum master is already a developer!');

    // Check if the user is maybe a project owner
    if (allUsersOnProject.filter(au => au.role == UserRole.ProjectOwner && au.userId == userId).length == 1)
      throw new BadRequestException('The project owner cannot be a developer.');

    try {
      await this.projectService.addUserToProject(projectId, userId, UserRole.Developer);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Remove role from user on project' })
  @ApiOkResponse()
  @Delete(':projectId/user/:userId/:role')
  async removeUserRoleFromProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('role', ParseIntPipe) role: number,
  ) {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException();
    await this.projectService.removeRoleFromUserOnProject(projectId, userId, role);
  }

  @ApiOperation({ summary: 'Remove developer from project' })
  @ApiOkResponse()
  @Delete(':projectId/removeDeveloper/:userId')
  async removeDeveloperFromProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('userId', ParseIntPipe) userId: number,
  ) {

    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Only the administrator and the scrum master are allowed to remove the developer.');

    let role: UserRole = UserRole.Developer;
    let developers: ProjectUserRole[] = await this.projectService.listUsersWithRoleOnProject(projectId, role);

    // Check if developer count in the project. 
    if (developers.length == 1)
      throw new BadRequestException('You cannot remove the only developer on a project.');

    await this.projectService.removeRoleFromUserOnProject(projectId, userId, role);
  }
}
