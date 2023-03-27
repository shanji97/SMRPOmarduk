import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, Logger, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AdminOnly } from '../auth/decorator/admin-only.decorator';
import { CreateProjectDto, CreateProjectSchema } from './dto/create-project.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { Token } from '../auth/decorator/token.decorator';
import { Project } from './project.entity';
import { ProjectService } from './project.service';
import { ValidationException } from '../common/exception/validation.exception';
import { MemberService } from '../member/member.service';
import { AdminOnlyGuard } from 'src/auth/guard/admin-only.guard';
import { UserService } from 'src/user/user.service';

@ApiTags('project')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('project')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly memberService: MemberService,
    private readonly userService: UserService
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
      // Chech if user actullally exist in the database.
      for (const member of project.members) {
        let user = await this.userService.getUserById(member.userId);
        if (user == null) {
          throw new NotFoundException(`User by ID ${member.userId} not found in the database.`);
        }
      }
      //Check if only one member is product owner and if this member does not have any other roles.
      if (!this.memberService.hasValidProjectOwner(project.members, 2)) {
        throw new BadRequestException('There should only be one product owner, which cannot be anything else.');
      }


      // Check if there are all required roles.
      if (!this.memberService.hasValidScrumMaster(project.members, 1) || !this.memberService.hasAtLeastOneDeveloper(project.members,0)) {
        throw new BadRequestException('All roles must be included in the project, only one scrum master.');
      }

      const row = await this.projectService.createProject(project);
      const projectId = JSON.parse(JSON.stringify(row)).id;
      await this.memberService.createMember(projectId, project.members);
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
}
