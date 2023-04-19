import { BadRequestException, ConflictException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, HttpException, HttpStatus, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateStoryDto, CreateStorySchema } from './dto/create-story.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { UpdateStoryDto, UpdateStorySchema } from './dto/update-story.dto';
import { Category, Story } from './story.entity';
import { StoryService } from './story.service';
import { TestService as StoryTestService } from '../test/test.service';
import { ValidationException } from '../common/exception/validation.exception';
import { Token } from '../auth/decorator/token.decorator';
import { ProjectService } from '../project/project.service';
import { UserRole } from '../project/project-user-role.entity';
import { UpdateStoryCategoryDto, UpdateStoryCategoryStorySchema } from './dto/update-story-category.dto';
import { StoryTest } from '../test/test.entity';

@ApiTags('story')
// @ApiBearerAuth()
// @ApiUnauthorizedResponse()
// @UseGuards(AuthGuard('jwt'))
@Controller('story')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly testService: StoryTestService,
    private readonly projectService: ProjectService,
  ) { }

  @ApiOperation({ summary: 'List stories.' })
  @ApiOkResponse()
  @Get()
  async listStories(): Promise<Story[]> {
    return await this.storyService.getAllStories();
  }

  @ApiOperation({ summary: 'Get story by ID.' })
  @ApiOkResponse()
  @Get(':storyId')
  async getStory(@Param('storyId', ParseIntPipe) storyId: number): Promise<Story> {
    const story: Story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new NotFoundException('Story not found.');
    return story;
  }

  @ApiOperation({ summary: 'Get tests for a particular story.' })
  @ApiOkResponse()
  @Get(':storyId/tests')
  async getTestForStory(@Param('storyId', ParseIntPipe) storyId: number): Promise<StoryTest[]> {
    const storyTests: StoryTest[] = await this.testService.getTestsByStory(storyId);
    if (!storyTests)
      throw new NotFoundException('Tests for story not found.');
    return storyTests;
  }

  @ApiOperation({ summary: 'Create story.' })
  @ApiCreatedResponse()
  @Post(':projectId')
  async createStory(@Token() token, @Body(new JoiValidationPipe(CreateStorySchema)) story: CreateStoryDto, @Param('projectId', ParseIntPipe) projectId: number) {
    try {
      let hasValidRole: boolean = await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]);
      if (!hasValidRole)
        throw new ForbiddenException('The user you are trying to add the story with is neither a scrum master nor a product owner.');

      const row = await this.storyService.createStory(story, projectId);
      const storyId = row["id"];
      await this.testService.createTest(storyId, story.tests);

    } catch (ex) {
      if (ex instanceof ConflictException) {
        throw new HttpException(ex.message, HttpStatus.CONFLICT)
      } else if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Get story data by project ID.' })
  @ApiOkResponse()
  @Get(':projectId')
  async getStoriesWithData(@Param('projectId', ParseIntPipe) projectId: number): Promise<Story[]> {
    return await this.storyService.getStoriesByProjectId(projectId);
  }

  @ApiOperation({ summary: 'Update story category.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Patch(':storyId/category')
  async updateStoryCategory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStoryCategoryStorySchema)) updateData: UpdateStoryCategoryDto): Promise<void> {
    try {
      const usersOnProject = (await this.projectService.listUsersWithRolesOnProject(updateData.projectId)).filter(users => users.userId == token.sid);
      if (usersOnProject == null)
        throw new BadRequestException('This project doesn\'t exist.');

      const isDeveloper = usersOnProject.length == 1 && usersOnProject[0].role == UserRole.Developer;
      if (updateData.category == Category.Unassigned && usersOnProject.length == 0 || isDeveloper)
        throw new ForbiddenException('No users with this user ID on the project or this user is only a developer.');

      await this.storyService.updateStoryCategory(storyId, updateData.category);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex)
      else if (ex instanceof NotFoundException)
        throw new NotFoundException(ex)
      throw ex
    }
  }

  @ApiOperation({ summary: 'Update story.' })
  @ApiOkResponse()
  @Patch('/:projectId/story/:storyId')
  async updateStory(@Token() token, @Param('projectId', ParseIntPipe) projectId: number, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStorySchema)) story: UpdateStoryDto) {
    try {

      let usersOnProject = await this.projectService.listUsersWithRolesOnProject(projectId);
      let isProjectOwnerOrScrumMaster = usersOnProject.filter(user => user.role != UserRole.Developer && user.userId == token.sid).length == 1;
      if (!isProjectOwnerOrScrumMaster)
        throw new ForbiddenException('Only the product owner and the scrum master can update the story in a project.');

      let checkStory = await this.storyService.getStoryById(storyId);
      if (checkStory.isRealized)
        throw new BadRequestException('The story is already realized, so it cannot be updated.');

      if (await this.storyService.isStoryInSprint(storyId))
        throw new BadRequestException('The story has been already added to sprint.');

      await this.storyService.updateStoryById(storyId, story);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Realize test.' })
  @ApiOkResponse()
  @Patch('/test/:testId')
  async realizeTest(@Token() token, @Param('testId', ParseIntPipe) testId: number) {
    const test: StoryTest = await this.testService.getTestById(testId);
    if (test.isRealized)
      throw new BadRequestException('Test is already realized.');

    const story: Story = await this.storyService.getStoryById(test.storyId);
    const usersOnProject = (await this.projectService.listUsersWithRolesOnProject(story.projectId)).filter(user => user.role == UserRole.ProjectOwner || user.role == UserRole.ScrumMaster && user.userId == token.sid);
    if (usersOnProject.length == 0)
      throw new ForbiddenException('Only the product owner and scrum master can realize tests.');

    await this.testService.realizeTestById(testId);
  }

  @ApiOperation({ summary: 'Delete test from story.' })
  @ApiNoContentResponse()
  @Delete('/test/:testId')
  async deleteTest(@Token() token, @Param('testId', ParseIntPipe) testId: number) {
    const test: StoryTest = await this.testService.getTestById(testId);
    if (test.isRealized)
      throw new BadRequestException('Test is already realized.');

    const story: Story = await this.storyService.getStoryById(test.storyId);
    await this.storyService.checkStoryProperties(story);
    const usersOnProject = (await this.projectService.listUsersWithRolesOnProject(story.projectId)).filter(user => user.role == UserRole.ProjectOwner || user.role == UserRole.ScrumMaster && user.userId == token.sid);
    if (usersOnProject.length == 0)
      throw new ForbiddenException('Only the product owner and scrum master can delete tests.');

    await this.testService.deleteTestById(testId);
  }

  @ApiOperation({ summary: 'Delete story.' })
  @ApiNoContentResponse()
  @Delete(':storyId')
  async deleteStory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number) {
    const story: Story = await this.storyService.getStoryById(storyId);
    await this.storyService.checkStoryProperties(story);
    const usersOnProject = (await this.projectService.listUsersWithRolesOnProject(story.projectId)).filter(user => user.role == UserRole.ProjectOwner || user.role == UserRole.ScrumMaster && user.userId == token.sid);
    if (usersOnProject.length == 0)
      throw new ForbiddenException('Only the product owner and scrum master can delete stories.');

    await this.storyService.deleteStoryById(storyId);
  }
}