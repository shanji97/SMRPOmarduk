import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';

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
    task.storyId = storyId;
    
    if (task.assignedUserId)
      task.category = TaskCategory.ASSIGNED;

    await this.taskRepository.insert(task);
  }

  async updateTask(taskId: number, task: DeepPartial<Task>): Promise<void> {
    await this.taskRepository.update({ id: taskId }, task);
  }

  async deleteTask(taskId: number): Promise<void> {
    await this.taskRepository.delete({ id: taskId });
  }

  async getTaskProjectId(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findOne({ where: { id: taskId }, relations: ['story']});
    if (!task)
      return null;
    return task.story.projectId;
  }

  async assignTaskToUser(taskId: number, userId: number): Promise<void> {
    const task = await this.getTaskById(taskId);
    if (task.category === TaskCategory.UNASSIGNED) {
      await this.taskRepository.update({ id: taskId }, { category: TaskCategory.ASSIGNED, assignedUserId: userId });
    } else {
      await this.taskRepository.update({ id: taskId }, { assignedUserId: userId });
    }
  }

  async releaseTask(taskId: number): Promise<void> {
    const task = await this.getTaskById(taskId);
    if (task.category !== TaskCategory.ENDED) {
      await this.taskRepository.update({ id: taskId }, { category: TaskCategory.UNASSIGNED, assignedUserId: null });
    } else {
      await this.taskRepository.update({ id: taskId }, { assignedUserId: null });
    }
  }

  async hasUserPermissionForTask(userId: number, taskId: number): Promise<boolean> {
    const task = await this.getTaskById(taskId);
    if (!task)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, task.storyId);
  }

}
