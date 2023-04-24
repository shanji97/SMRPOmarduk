import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository, QueryFailedError } from 'typeorm';

import { ProjectService } from '../project/project.service';
import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';
import { TaskUserTime } from './task-user-time.entity';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class TaskService {
  private readonly logger: Logger = new Logger(TaskService.name);

  constructor(
    private readonly projectService: ProjectService,
    private readonly storyService: StoryService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUserTime)
    private readonly taskUserTimeRepository: Repository<TaskUserTime>,
  ) {}

  async getTasksForStory(storyId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { storyId: storyId } });
  }

  async getTasksForSprint(sprintId: number): Promise<Task[]> {
    const storyIds: number[] = await this.storyService.getStoryIdsForSprint(sprintId);

    return await this.taskRepository.findBy({ storyId: In(storyIds) });
  }

  async getTaskById(taskId: number): Promise<Task> {
    return await this.taskRepository.findOneBy({ id: taskId });
  }

  async getStoryIdForTaskById(taskId: number): Promise<number | null> {
    const result = await this.taskRepository.findOne({ where: { id: taskId }, select: ['storyId'] });
    return result.storyId || null;
  }

  async createTask(storyId: number, task: DeepPartial<Task>): Promise<void> {
    // Check if we are trying to insert task into active sprint
    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new ValidationException('Story not in active sprint');

    // TODO: Check remaining value

    task.storyId = storyId;
    
    if (task.assignedUserId)
      task.category = TaskCategory.ASSIGNED;

    await this.taskRepository.insert(task);
  }

  async updateTask(taskId: number, task: DeepPartial<Task>): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    // TODO: Check remaining value

    await this.taskRepository.update({ id: taskId }, task);
  }

  async deleteTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    await this.taskRepository.delete({ id: taskId });
  }

  async getTaskProjectId(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findOne({ where: { id: taskId }, relations: ['story']});
    if (!task)
      return null;
    return task.story.projectId;
  }

  async assignTaskToUser(taskId: number, userId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category != TaskCategory.UNASSIGNED)
      throw new ValidationException('Task is not unassigned');
    
    // Only users that have role on project, can be assigned to task
    const projectId: number = await this.getTaskProjectId(task.id);
    if (!await this.projectService.hasUserRoleOnProject(projectId, userId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ValidationException('User hasn\'t got role on the project');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ASSIGNED,
      dateAssigned: () => 'NOW()', // TODO: Check if working
      assignedUserId: userId,
    });
  }

  async acceptTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (!task.assignedUserId || task.category != TaskCategory.ASSIGNED)
      throw new ValidationException('Task not assigned to user');
    
    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ACCEPTED,
      dateAccepted: () => 'NOW()', // TODO: Check if working
    });
  }

  async rejectTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (!task.assignedUserId || task.category != TaskCategory.ASSIGNED)
      throw new ValidationException('Task not assigned to user');
    
    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.UNASSIGNED,
      dateAssigned: null,
      assignedUserId: null,
    });
  }

  async releaseTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (![TaskCategory.ACCEPTED, TaskCategory.ACTIVE, TaskCategory.ASSIGNED, TaskCategory.UNASSIGNED].includes(task.category))
      throw new ValidationException('User can\'t be unassigned');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.UNASSIGNED,
      dateAccepted: null,
      dateActive: null,
      dateAssigned: null,
      assignedUserId: null,
    });
  }

  async isTaskInActiveSprint(taskId: number): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId) // Task does not exit
      return false;
    return await this.storyService.isStoryInActiveSprint(storyId);
  }

  async hasUserPermissionForTask(userId: number, taskId: number): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, storyId);
  }

  async getWorkOnTask(taskId: number): Promise<TaskUserTime[]> {
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId }, relations: ['user'], order: { 'date': 'ASC' }})
  }

  async setWorkOnTask(date: string, taskId: number, userId: number, work: DeepPartial<TaskUserTime>): Promise<void> {
    work.date = date;
    work.taskId = taskId;
    work.userId = userId;
    await this.taskUserTimeRepository.upsert(work, ['date', 'taskId', 'userId']);
  }

  async removeWorkOnTask(date: string, taskId: number, userId: number): Promise<void> {
    await this.taskUserTimeRepository.delete({ date: date, taskId: taskId, userId: userId });
  }
}
