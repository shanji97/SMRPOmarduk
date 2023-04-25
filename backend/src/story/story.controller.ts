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
import { UpdateStoryTimeComplexityDto, UpdateStoryTimeComplexitySchema } from './dto/update-time-complexity.dto';
import { StoryNotificationDto, StoryNotificationSchema } from './dto/reject-story.dto';
import { StoryNotificationService } from '../story-notification/story-notification.service';
import { NotificationStatus, StoryNotification } from '../story-notification/story-notification.entity';
import { UpdateStoryBacklogSchema, UpdateStoryBacklogDto } from './dto/update-story-backlog.dto';

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
    private readonly storyNotificationService: StoryNotificationService,
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

  @ApiOperation({ summary: 'Stories written by particular user.' })
  @ApiOkResponse()
  @Get('/by-user/:userId')
  async getStoriesByUserId(@Param('userId', ParseIntPipe) userId: number): Promise<Story[]> {
    const stories: Story[] = await this.storyService.getStoriesByUserId(userId);
    if (!stories)
      throw new NotFoundException('Tests for story not found.');
    return stories;
  }

  @ApiOperation({ summary: 'Get notifications for a particular story.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':storyId/notifications/information')
  async getNotificationsForStory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number): Promise<StoryNotification[]> {

    const storyNotifications: StoryNotification[] = await this.storyNotificationService.getStoryNotificationsByStoryId(storyId, NotificationStatus.Info);
    if (!storyNotifications)
      throw new NotFoundException('Notifications for story not found.');

    const story: Story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new NotFoundException('Story for the given ID not found.');

    // If the user is only a developer he can see only approved notifications.
    if (await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.Developer]) && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ScrumMaster]))
      return storyNotifications.filter(sn => sn.approved == true);
    return storyNotifications;
  }

  @ApiOperation({ summary: 'Get notifications for a particular story.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':storyId/notifications/rejection')
  async getRejectionNotificationsForStory(@Token() token, @Param('storyId', ParseIntPipe) storyId: number): Promise<StoryNotification[]> {

    const storyNotifications: StoryNotification[] = await this.storyNotificationService.getStoryNotificationsByStoryId(storyId, NotificationStatus.Rejected);
    if (!storyNotifications)
      throw new NotFoundException('Notifications for story not found.');

    const story: Story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new NotFoundException('Story for the given ID not found.');

    // If the user is only a developer he can see only approved notifications.
    if (await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.Developer]) && !await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ScrumMaster]))
      return storyNotifications.filter(sn => sn.approved == true);
    return storyNotifications;
  }


  @ApiOperation({ summary: 'Create story.' })
  @ApiCreatedResponse()
  @Post(':projectId')
  async createStory(@Token() token, @Body(new JoiValidationPipe(CreateStorySchema)) story: CreateStoryDto, @Param('projectId', ParseIntPipe) projectId: number) {
    try {
      let hasValidRole: boolean = await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]);
      if (!hasValidRole)
        throw new ForbiddenException('The user you are trying to add the story with is neither a scrum master nor a product owner.');

      const row = await this.storyService.createStory(story, projectId, token.sid);
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

  @ApiOperation({ summary: 'Create story notification.' })
  @ApiCreatedResponse()
  @Post(':storyId/notification/new')
  async createStoryNotification(@Token() token, @Param('storyId') storyId: number, @Body(new JoiValidationPipe(StoryNotificationSchema)) storyNotification: StoryNotificationDto) {
    try {
      if (!storyNotification.description)
        throw new BadRequestException('The story notification description cannot be empty.');

      const story: Story = await this.storyService.getStoryById(storyId);
      if (!story)
        throw new NotFoundException('Story for the given ID not found.');

      if (!await this.projectService.hasUserRoleOnProject(storyId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster, UserRole.Developer]))
        throw new ForbiddenException('The user you are trying to add the story with is neither a scrum master nor a product owner but certainly not a developer.');

      // Product owner can directly approve the notification
      if (await this.projectService.hasUserRoleOnProject(storyId, token.sid, [UserRole.ProjectOwner])) {
        await this.storyNotificationService.createNotification(storyNotification.description, token.sid, storyId, NotificationStatus.Info, true);
      } else {
        await this.storyNotificationService.createNotification(storyNotification.description, token.sid, storyId, NotificationStatus.Info, false);
      }
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

      const story: Story = await this.storyService.getStoryById(storyId);
      if (!story)
        throw new BadRequestException('No story by the given ID found.');

      if (story.category == Category.Finished)
        throw new BadRequestException('You cannot update the category of finished stories.');

      await this.storyService.updateStoryCategory(storyId, updateData.category);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex)
      else if (ex instanceof NotFoundException)
        throw new NotFoundException(ex)
      throw ex
    }
  }

  @ApiOperation({ summary: 'Update story backlog.' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Patch(':storyId/backlog')
  async updateStoryBacklog(@Token() token, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStoryBacklogSchema)) updateData: UpdateStoryBacklogDto): Promise<void> {
    try {
      const usersOnProject = (await this.projectService.listUsersWithRolesOnProject(updateData.projectId)).filter(users => users.userId == token.sid);
      if (usersOnProject == null)
        throw new BadRequestException('This project doesn\'t exist.');

      await this.storyService.updateStoryBacklog(storyId, updateData.backlog);
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

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ScrumMaster]))
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
    if (!story) {
      throw new BadRequestException('The story by the given ID does not exist.');
    }

    if (story.isRealized)
      throw new BadRequestException('Story is already realized.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner]))
      throw new ForbiddenException('Only a product owner can realize a story.');

    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('The story is already outside an active sprint.');

    if (story.category == Category.Finished)
      throw new BadRequestException('The story was already finished.');

    await this.storyService.setRealizeFlag(storyId, true);
  }

  @ApiOperation({ summary: 'Reject story.' })
  @ApiOkResponse()
  @Patch(':storyId/reject')
  async rejectStories(@Token() token, @Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(StoryNotificationSchema)) rejectStoryData: StoryNotificationDto) {
    let story: Story = await this.storyService.getStoryById(storyId);

    if (!story) {
      throw new BadRequestException('The story by the given ID does not exist.');
    }

    if (!story.isRealized)
      throw new BadRequestException('Story is not realized.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner]))
      throw new ForbiddenException('Only a product owner can realize a story.');

    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new BadRequestException('The story is already outside an active sprint.');

    if (story.category == Category.Finished)
      throw new BadRequestException('The story was already finished.');

    await this.storyService.setRealizeFlag(storyId, false);
    if (rejectStoryData.description) {
      await this.storyNotificationService.createNotification(rejectStoryData.description, token.sid, storyId, NotificationStatus.Rejected, true);
    }
  }

  @ApiOperation({ summary: 'Approve notification for a story.' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Patch('/notification/:notificationId/approve')
  async approveNotification(@Token() token, @Param('notificationId', ParseIntPipe) notificationId: number) {

    const storyNotification: StoryNotification = await this.storyNotificationService.getNotificationById(notificationId);
    if (!storyNotification)
      throw new NotFoundException('Notification by the given ID not found.');

    if (storyNotification.approved || storyNotification.notificationType == NotificationStatus.Rejected)
      throw new BadRequestException('The notification is either already approved or is notification of a rejection type.');

    const story: Story = await this.storyService.getStoryById(storyNotification.storyId);
    if (!story)
      throw new NotFoundException('Story by the given ID not found.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]))
      throw new ForbiddenException('Only product owner and scrum master can approve the notifications.');

    await this.storyNotificationService.approveNotification(notificationId);
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

      await this.testService.deleteTestsByStoryId(storyId);

      await this.testService.createTest(storyId, story.tests);

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

  @ApiOperation({ summary: 'Approve notification for a story.' })
  @ApiNotFoundResponse()
  @ApiNoContentResponse()
  @Delete('/notification/:notificationId/')
  async deleteNotification(@Token() token, @Param('notificationId', ParseIntPipe) notificationId: number) {

    const storyNotification: StoryNotification = await this.storyNotificationService.getNotificationById(notificationId);
    if (!storyNotification)
      throw new NotFoundException('Notification by the given ID not found.');

    const story: Story = await this.storyService.getStoryById(storyNotification.storyId);
    if (!story)
      throw new NotFoundException('Story by the given ID not found.');

    if (!await this.projectService.hasUserRoleOnProject(story.projectId, token.sid, [UserRole.ProjectOwner]))
      throw new ForbiddenException('Only product owner and scrum master can approve the notifications.');

    await this.storyNotificationService.deleteNotification(notificationId);
  }
}