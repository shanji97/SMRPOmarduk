import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, HttpCode, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, InternalServerErrorException, HttpException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateTaskDto, CreateTaskSchema } from './dto/create-task.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { ProjectService } from '../project/project.service';
import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';
import { TaskService } from './task.service';
import { Token } from '../auth/decorator/token.decorator';
import { TokenDto } from '../auth/dto/token.dto';
import { UpdateTaskDto, UpdateTaskSchema } from './dto/update-task.dto';
import { UserRole } from '../project/project-user-role.entity';

@ApiTags('task')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('task')
export class TaskController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly storyService: StoryService,
    private readonly taskService: TaskService,
  ) {}
  
  @ApiOperation({ summary: 'List tasks for story' })
  @ApiOkResponse()
  @Get('story/:storyId')
  async listTasksForStory(
    @Token() token: TokenDto,
    @Param('storyId', ParseIntPipe) storyId: number,
  ): Promise<Task[]> {
    if (!await this.storyService.hasUserPermissionForStory(token.sid, storyId))
      throw new ForbiddenException();
    
    return await this.taskService.getTasksForStory(storyId);
  }

  @ApiOperation({ summary: 'List tasks for sprint (WIP)'})
  @ApiOkResponse()
  @Get('sprint/:sprintId')
  async listTasksForSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Task[]> {
    // TODO: Permission check

    return [];
  }

  @ApiOperation({ summary: 'Get task by ID'})
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':taskId')
  async getTaskById(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<Task> {
    if (!await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    const result = await this.taskService.getTaskById(taskId);
    if (!result)
      throw new NotFoundException();
    return result;
  }

  @ApiOperation({ summary: 'Create task' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':storyId')
  async createTask(
    @Token() token: TokenDto,
    @Param('storyId', ParseIntPipe) storyId: number,
    @Body(new JoiValidationPipe(CreateTaskSchema)) task: CreateTaskDto,
  ): Promise<void> {
    if (!await this.storyService.hasUserPermissionForStory(token.sid, storyId))
      throw new ForbiddenException();

    await this.taskService.createTask(storyId, task);
  }

  @ApiOperation({ summary: 'Update task' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Patch(':taskId')
  async updateTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body(new JoiValidationPipe(UpdateTaskSchema)) task: UpdateTaskDto,
  ): Promise<void> {
    if (!await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();
    
    await this.taskService.updateTask(taskId, task);
  }

  @ApiOperation({ summary: 'Delete task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':taskId')
  async deleteTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<void> {
    if (!await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();
    
    // Can't delete active or ended tasks
    const task = await this.taskService.getTaskById(taskId);
    if (!task)
      throw new NotFoundException();
    if (task.category === TaskCategory.COMPLETED)
      throw new ForbiddenException('Can\'t delete ended task');

    await this.taskService.deleteTask(taskId);
  }

  @ApiOperation({ summary: 'Assign task to user'})
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  @Post(':taskId/assign/:userId')
  async assignTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number, 
  ): Promise<void> {
    if (!await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    const projectId: number = await this.taskService.getTaskProjectId(taskId);

    // Check if task exitsts
    const task = await this.taskService.getTaskById(taskId);
    if (!task)
      throw new NotFoundException();
    // User can accept task; admin and scrum master can reassign people
    if (task.assignedUserId != null && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Someone is already assigned to task');

    // User can assign only himself, project scrum master can also others
    if (token.sid !== userId && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't assign other users to task");

    await this.taskService.assignTaskToUser(taskId, userId);
  }

  // TODO: Accept

  // TODO: Reject

  @ApiOperation({ summary: 'Release task (remove assigned user)' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':taskId/release')
  async releaseTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<void> {
    if (!await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    // Check if someone is already assigned to task or if task even exitsts
    const task = await this.taskService.getTaskById(taskId);
    if (!task)
      throw new NotFoundException();

    // User can assign only himself, project scrum master can also others
    if (token.sid !== task.assignedUserId && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't remove user from task");
    
    await this.taskService.releaseTask(taskId);
  }
}
