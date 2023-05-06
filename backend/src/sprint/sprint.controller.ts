import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport'; import { CreateSprintDto, CreateSprintSchema } from './dto/create-sprint.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { ProjectService } from '../project/project.service';
import { Sprint } from './sprint.entity';
import { SprintService } from './sprint.service';
import { Story } from '../story/story.entity';
import { StoryService } from '../story/story.service';
import { Token } from '../auth/decorator/token.decorator';
import { TokenDto, tokenSchema } from '../auth/dto/token.dto';
import { UpdateSprintDto, UpdateSprintSchema } from './dto/update-sprint.dto';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@ApiTags('sprint')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('sprint')
export class SprintController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly sprintService: SprintService,
    private readonly storyService: StoryService
  ) { }

  @ApiOperation({ summary: 'List sprints for project.' })
  @ApiOkResponse()
  @Get('project/:projectId')
  async listSprintsForProject(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<Sprint[]> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, null))
      throw new ForbiddenException();

    return await this.sprintService.listSprintsForProject(projectId);
  }

  @ApiOperation({ summary: 'List stories for sprint' })
  @ApiOkResponse()
  @Get(':sprintId/story')
  async listStoriesForSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Story[]> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    return await this.sprintService.getStoriesForSprintById(sprintId);
  }

  @ApiOperation({ summary: 'List unfinished stories for sprint.' })
  @ApiOkResponse()
  @Get(':sprintId/story/unfinished')
  async listUnfinishedStoriesForSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Story[]> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    return await this.sprintService.getUnfinishedStoriesForSprintById(sprintId);
  }

  @ApiOperation({ summary: 'List unrealized stories for sprint.' })
  @ApiOkResponse()
  @Get(':sprintId/story/unrealized-stories')
  async listUnrealizedStoriesForSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Story[]> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    return await this.sprintService.getUnrealizedStoriesForSprintById(sprintId);
  }

  @ApiOperation({ summary: 'Get active sprint for project.' })
  @ApiOkResponse()
  @Get('project/:projectId/active')
  async getActiveSprintByProjectId(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
  ): Promise<Sprint> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.Developer, UserRole.ScrumMaster, UserRole.ProjectOwner]))
      throw new ForbiddenException();

    const sprint = await this.sprintService.getActiveSprintForProject(projectId);
    if (!sprint)
      throw new NotFoundException();
    return sprint;
  }

  @ApiOperation({ summary: 'Get sprint by ID.' })
  @ApiOkResponse()
  @Get(':sprintId')
  async getSprintById(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Sprint> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    const sprint = await this.sprintService.getSprintById(sprintId);
    if (!sprint)
      throw new NotFoundException();
    return sprint;
  }

  @ApiOperation({ summary: 'Create new sprint.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':projectId')
  async createSprint(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new JoiValidationPipe(CreateSprintSchema)) sprint: CreateSprintDto,
  ): Promise<void> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException();
    try {
      await this.sprintService.createSprint(projectId, sprint);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Update sprint.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Patch(':sprintId')
  async updateSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
    @Body(new JoiValidationPipe(UpdateSprintSchema)) sprint: UpdateSprintDto,
  ): Promise<void> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserEditPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    try {
      await this.sprintService.updateSprintById(sprintId, sprint);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Add story to sprint.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':sprintId/add-story/:storyId')
  async addStoryToSprint(@Token() token: TokenDto, @Param('sprintId', ParseIntPipe) sprintId: number, @Param('storyId', ParseIntPipe) storyId: number) {
    const story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new BadRequestException('No story with the given ID exists');

    if (story.timeComplexity < 1)
      throw new BadRequestException('Time complexity of a story cannot be negative or zero.');

    if (story.isRealized)
      throw new BadRequestException('The story is already realized.');

    if (await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('The story is already in an active sprint.');

    const sprint = await this.sprintService.getSprintById(sprintId);
    if (!sprint)
      throw new BadRequestException('No sprint with the given ID exists in the ');

    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Only the scrum master can add the story to sprint.');

    await this.sprintService.addStoryToSprint(sprintId, storyId);
  }

  @ApiOperation({ summary: 'Delete sprint.' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':sprintId')
  async deleteSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<void> {
    // Check permissions
    if (!token.isAdmin && !await this.sprintService.hasUserEditPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();

    await this.sprintService.deleteSprintById(sprintId);
  }
}
