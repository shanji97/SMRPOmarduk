import { BadRequestException, ConflictException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, HttpException, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
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
import { UpdateStoryTimeComplexityDto, UpdateStoryTimeComplexitySchema } from './dto/update-time-complexity.dto';

@ApiTags('story')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
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
  @Get(':projectId/stories-by-project')
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

  @ApiOperation({ summary: 'Update time complexity of a story.' })
  @ApiOkResponse()
  @Patch(':storyId/time-complexity')
  async updateStoryTimeComplexity(@Token() token, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStoryTimeComplexitySchema)) timeComplexityInfo: UpdateStoryTimeComplexityDto) {
    let story: Story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new BadRequestException('The story by this ID does not exist.');

    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the scrum master can update the time complexity of a story in a project.');

    if (await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('Cannot update time complexity. The story is already in active sprint.')

    await this.storyService.updateStoryTimeComplexity(storyId, timeComplexityInfo.timeComplexity);

  }

  @ApiOperation({ summary: 'Realize story.' })
  @ApiOkResponse()
  @Patch(':storyId/confirm')
  async confirmStories(@Token() token, @Param('storyId', ParseIntPipe) storyId: number) {
    let story: Story = await this.storyService.getStoryById(storyId);
    if (story.isRealized)
      throw new BadRequestException('Story is already realized.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner]))
      throw new ForbiddenException('Only a product owner can realize a story.');

    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('The story is already outside an active sprint.');

    if (story.category == Category.Finished)
      throw new BadRequestException('The story was already finished.');

    this.storyService.realizeStory(storyId);
  }

  @ApiOperation({ summary: 'Reject story.' })
  @ApiOkResponse()
  @Patch(':storyId/reject')
  async rejectStories(@Token() token, @Param('storyId', ParseIntPipe) storyId: number) {
    let story: Story = await this.storyService.getStoryById(storyId);
    if (!story.isRealized)
      throw new BadRequestException('Story is not realized.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner]))
      throw new ForbiddenException('Only a product owner can realize a story.');

    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('The story is already outside an active sprint.');

    if (story.category == Category.Finished)
      throw new BadRequestException('The story was already finished.');

    this.storyService.realizeStory(storyId);
  }

  @ApiOperation({ summary: 'Update story.' })
  @ApiOkResponse()
  @Patch(':storyId/update')
  async updateStory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStorySchema)) story: UpdateStoryDto) {
    try {
      let checkStory = await this.storyService.getStoryById(storyId);
      if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(checkStory.projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]))
        throw new ForbiddenException('Only the product owner and the scrum master can update the story in a project.');

      if (checkStory.isRealized)
        throw new BadRequestException('The story is already realized, so it cannot be updated.');

      if (await this.storyService.isStoryInSprint(storyId))
        throw new BadRequestException('The story has been already added to sprint.');

      await this.storyService.updateStoryById(storyId, story);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new ConflictException(ex.message);
      else if (ex instanceof ConflictException)
        throw new ConflictException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Realize test.' })
  @ApiOkResponse()
  @Patch('/test/:testId/realize')
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
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the product owner and scrum master can delete tests.');

    await this.testService.deleteTestById(testId);
  }

  @ApiOperation({ summary: 'Delete story.' })
  @ApiNoContentResponse()
  @Delete(':storyId')
  async deleteStory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number) {
    const story: Story = await this.storyService.getStoryById(storyId);
    await this.storyService.checkStoryProperties(story);

    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]))
      throw new ForbiddenException('Only the product owner and scrum master can delete stories.');

    if (await this.storyService.isStoryInSprint(storyId))
      throw new BadRequestException('This story is already a part of a print.');

    await this.storyService.deleteStoryById(storyId);
  }
}