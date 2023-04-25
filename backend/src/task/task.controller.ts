import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, HttpCode, NotFoundException, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, UseGuards, InternalServerErrorException, HttpException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import * as Joi from 'joi';

import { CreateTaskDto, CreateTaskSchema } from './dto/create-task.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { ProjectService } from '../project/project.service';
import { SprintService } from '../sprint/sprint.service';
import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';
import { TaskService } from './task.service';
import { TaskUserTime } from './task-user-time.entity';
import { TaskUserTimeDto, TaskUserTimeSchema } from './dto/task-user-time.dto';
import { Token } from '../auth/decorator/token.decorator';
import { TokenDto } from '../auth/dto/token.dto';
import { UpdateTaskDto, UpdateTaskSchema } from './dto/update-task.dto';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@ApiTags('task')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('task')
export class TaskController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly sprintService: SprintService,
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
    if (!token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId))
      throw new ForbiddenException();
    
    return await this.taskService.getTasksForStory(storyId);
  }

  @ApiOperation({ summary: 'List tasks for sprint'})
  @ApiOkResponse()
  @Get('sprint/:sprintId')
  async listTasksForSprint(
    @Token() token: TokenDto,
    @Param('sprintId', ParseIntPipe) sprintId: number,
  ): Promise<Task[]> {
    if (!token.isAdmin && !await this.sprintService.hasUserPermissionForSprint(token.sid, sprintId))
      throw new ForbiddenException();
    
    return this.taskService.getTasksForSprint(sprintId);
  }

  @ApiOperation({ summary: 'Get task by ID'})
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':taskId')
  async getTaskById(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<Task> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
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
    if (!token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();
    
    // Check if story part of active sprint
    if (!await this.storyService.isStoryInActiveSprint(storyId) && !token.isAdmin && !await this.storyService.hasUserPermissionForStory(storyId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    const assignedUserId: number = task.assignedUserId;
    if (assignedUserId || task.assignedUserId === null)
      delete task.assignedUserId;
    
    try {
      const taskId = await this.taskService.createTask(storyId, task);
      if (!taskId)
        throw new InternalServerErrorException('Failed to create task');

      await this.assignTask(token, taskId, assignedUserId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
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
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();
    
    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    try {
      await this.taskService.updateTask(taskId, task);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Delete task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':taskId')
  async deleteTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<void> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();
    
    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    // Can't delete active or ended tasks
    const task = await this.taskService.getTaskById(taskId);
    
    if (task.category === TaskCategory.ENDED)
      throw new ForbiddenException('Can\'t delete ended task');

    // After task is assigned it can be deleted only by assigned user, scrum master or admin 
    if (task.assignedUserId && task.assignedUserId !== token.sid && !token.isAdmin && !await this.storyService.hasUserPermissionForStory(task.storyId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Insufficient permissions to delete task');
    
    try {
      await this.taskService.deleteTask(taskId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
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
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    const projectId: number = await this.taskService.getTaskProjectId(taskId);

    // Check if task exists
    const task = await this.taskService.getTaskById(taskId);
    
    // User can accept task; admin and scrum master can reassign people
    if (task.assignedUserId != null && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException('Someone is already assigned to task');

    // User can assign only himself, project scrum master can also others
    if (token.sid !== userId && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't assign other users to task");

    try {
      await this.taskService.assignTaskToUser(taskId, userId);

      // If user asigns himself to task automatically accepts
      if (userId === token.sid)
        await this.taskService.acceptTask(taskId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({summary: 'Get task for burndown diagramm.'})
  @ApiOkResponse()
  @Get('/burdown-diagramm-data/:projectId')
  async getDataForProjectBurnDown(@Token() token: TokenDto,
  @Param('projectId', ParseIntPipe) projectId: number,): Promise<any>{
    return this.taskService.getTaskDataForBD(projectId);
  }

  @ApiOperation({ summary: 'Accept task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Post(':taskId/accept/:confirm')
  async acceptTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('confirm', ParseBoolPipe) confirm: boolean,
  ): Promise<void> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();
    
    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    const task = await this.taskService.getTaskById(taskId);

    // User can only accept tasks that were assigned to him
    if (task.assignedUserId !== token.sid)
      throw new ForbiddenException('Task was\'t assigned to you');

    try {
      if (confirm)
        await this.taskService.acceptTask(taskId);
      else
        await this.taskService.rejectTask(taskId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Release task (remove assigned user)' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':taskId/release')
  async releaseTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<void> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    // Check if someone is already assigned to task or if task even exitsts
    const task = await this.taskService.getTaskById(taskId);

    // User can assign only himself, project scrum master can also others
    if (token.sid !== task.assignedUserId && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't remove user from task");
    
    try {
      await this.taskService.releaseTask(taskId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Get work on task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Get(':taskId/time')
  async getWorkOnTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
  ): Promise<TaskUserTime[]> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    return await this.taskService.getWorkOnTask(taskId);
  }

  @ApiOperation({ summary: 'Set work of user on task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Post(':taskId/time/:userId/:date')
  async setWorkOnTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('date', new JoiValidationPipe(Joi.date())) date: string,
    @Body(new JoiValidationPipe(TaskUserTimeSchema)) work: TaskUserTimeDto
  ): Promise<void> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    // Check if user assigned to task
    const task = await this.taskService.getTaskById(taskId);

    // User can assign only himself, project scrum master can also others
    if ((token.sid !== userId || userId !== task.assignedUserId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't assign time on task");

    await this.taskService.setWorkOnTask(date, taskId, userId, work);
  }

  @ApiOperation({ summary: 'Delete work of user on task' })
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':taskId/time/:userId/:date')
  async deleteWorkOnTask(
    @Token() token: TokenDto,
    @Param('taskId', ParseIntPipe) taskId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @Param('date', new JoiValidationPipe(Joi.date())) date: string,
  ): Promise<void> {
    if (!token.isAdmin && !await this.taskService.hasUserPermissionForTask(token.sid, taskId))
      throw new ForbiddenException();

    // Check if task part of active sprint
    if (!await this.taskService.isTaskInActiveSprint(taskId) && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Task isn't part of active sprint");

    // Check if user assigned to task
    const task = await this.taskService.getTaskById(taskId);

    // User can remove only his time, project scrum master can also others
    if (token.sid !== task.assignedUserId && !token.isAdmin && !await this.projectService.hasUserRoleOnProject(await this.taskService.getTaskProjectId(taskId), token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException("Can't rime time on task");

    await this.taskService.removeWorkOnTask(date, taskId, userId);
  }
}
