import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class TaskService {
  private readonly logger: Logger = new Logger(TaskService.name);

  constructor(
    private readonly storyService: StoryService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
  ) {}

  async getTasksForStory(storyId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { storyId: storyId } });
  }

  async getTasksForSprint(sprintId: number): Promise<Task[]> {
    // TODO
    return [];
  }

  async getTaskById(taskId: number): Promise<Task> {
    return await this.taskRepository.findOneBy({ id: taskId });
  }

  async createTask(storyId: number, task: DeepPartial<Task>): Promise<void> {
    // TODO: Check if story is part of active sprint, else error

    // TODO: Check remaining value

    task.storyId = storyId;
    
    if (task.assignedUserId)
      task.category = TaskCategory.ASSIGNED;

    await this.taskRepository.insert(task);
  }

  async updateTask(taskId: number, task: DeepPartial<Task>): Promise<void> {
    // TODO: Check if task is part of active sprint

    // TODO: Check remaining value

    await this.taskRepository.update({ id: taskId }, task);
  }

  async deleteTask(taskId: number): Promise<void> {
    // TODO: Check if task is part of active sprint

    await this.taskRepository.delete({ id: taskId });
  }

  async getTaskProjectId(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findOne({ where: { id: taskId }, relations: ['story']});
    if (!task)
      return null;
    return task.story.projectId;
  }

  async assignTaskToUser(taskId: number, userId: number): Promise<void> {
    // TODO: Check if task is part of active sprint

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category != TaskCategory.UNASSIGNED)
      throw new ValidationException('Task is not unassigned');
    
    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ASSIGNED,
      dateAssigned: () => 'NOW()', // TODO: Check if working
      assignedUserId: userId,
    });
  }

  async acceptTask(taskId: number): Promise<void> {
    // TODO: Check if task is part of active sprint

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category != TaskCategory.ASSIGNED)
      throw new ValidationException('Task not assigned to user');
    
    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ACCEPTED,
      dateAccepted: () => 'NOW()', // TODO: Check if working
    });
  }

  // TODO: Reject task (reset date assigned)
  async rejectTask(taskId: number): Promise<void> {
    // TODO: Check if task is part of active sprint

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category != TaskCategory.ASSIGNED)
      throw new ValidationException('Task not assigned to user');
    
    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.UNASSIGNED,
      dateAssigned: null,
      assignedUserId: null,
    });
  }

  async releaseTask(taskId: number): Promise<void> {
    // TODO: Check if task is part of active sprint

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category == TaskCategory.ENDED)
      throw new ValidationException('Task already completed');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.UNASSIGNED,
      dateAccepted: null,
      dateActive: null,
      dateAssigned: null,
      assignedUserId: null,
    });
  }

  async hasUserPermissionForTask(userId: number, taskId: number): Promise<boolean> {
    const task = await this.getTaskById(taskId);
    if (!task)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, task.storyId);
  }

}
