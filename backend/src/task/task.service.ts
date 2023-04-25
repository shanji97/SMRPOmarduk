import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository, QueryFailedError } from 'typeorm';
import * as moment from 'moment';

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
    return await this.taskRepository.find({ where: { storyId: storyId }, relations: ['assignedUser'] });
  }

  async getTasksForSprint(sprintId: number): Promise<Task[]> {
    const storyIds: number[] = await this.storyService.getStoryIdsForSprint(sprintId);

    return await this.taskRepository.find({ where: { storyId: In(storyIds) }, relations: ['assignedUser'] });
  }

  async getTaskById(taskId: number): Promise<Task> {
    return await this.taskRepository.findOne({ where: { id: taskId }, relations: ['assignedUser'] });
  }

  async getStoryIdForTaskById(taskId: number): Promise<number | null> {
    const result = await this.taskRepository.findOne({ where: { id: taskId }, select: ['storyId'] });
    return result.storyId || null;
  }

  async createTask(storyId: number, task: DeepPartial<Task>): Promise<number> {
    // Check if we are trying to insert task into active sprint
    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new ValidationException('Story not in active sprint');

    // TODO: Check remaining value
    

    task.storyId = storyId;
    
    if (task.assignedUserId) {
      task.category = TaskCategory.ASSIGNED;
      task.dateAssigned = moment().format('YYYY-MM-DD');
    }

    const result = await this.taskRepository.insert(task);
    return result.raw.insertId || null;
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

  async startTaskTiming(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');
    
    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category == TaskCategory.ACTIVE)
      throw new ValidationException('Task already active'); 
    if (task.category !== TaskCategory.ACCEPTED)
      throw new ValidationException('Task not accepted');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ACTIVE,
      dateActive: () => 'NOW()',
    });
  }

  async stopTaskTiming(taskId: number): Promise<void> {
    // Allow to stop timing after sprint isn't active anymore

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category !== TaskCategory.ACTIVE)
      throw new ValidationException('Task not active');

    // Add log time record
    const elapsed = +(moment((<Date><unknown>task.dateActive).toISOString().replace('Z', '')).diff(moment(), 'm') / 60.0).toFixed(2); // Because problems with dates
    const today: string = moment().format('YYYY-MM-DD');
    const work = await this.getWorkOnTaskForUserByDate(taskId, task.assignedUserId, today);
    const last = await this.getLastWorkOnTask(taskId);
    await this.setWorkOnTask(today, taskId, task.assignedUserId, { spent: ((work) ? work.spent + elapsed : elapsed), remaining: last?.remaining || 0 });

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ACCEPTED,
      dateActive: null,
    });
  }

  async endTask(taskId: number): Promise<void> {
    // Allow to stop timing after sprint isn't active anymore

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category !== TaskCategory.ACCEPTED)
      throw new ValidationException('Task not accepted');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ENDED,
      dateActive: null,
    });
  }

  async isTaskInActiveSprint(taskId: number): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId) // Task does not exit
      return false;
    return await this.storyService.isStoryInActiveSprint(storyId);
  }

  async hasUserPermissionForTask(userId: number, taskId: number, role: UserRole[] | UserRole | number[] | number | null = null): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, storyId, role);
  }

  async getWorkOnTask(taskId: number): Promise<TaskUserTime[]> {
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId }, relations: ['user'], order: { 'date': 'ASC' }})
  }

  async getWorkOnTaskForUserByDate(taskId: number, userId: number, date: string): Promise<TaskUserTime | null> {
    const result = await this.taskUserTimeRepository.findOneBy({ taskId: taskId, userId: userId, date: date });
    return result || null;
  }

  async getLastWorkOnTask(taskId: number): Promise<TaskUserTime | null> {
    const result = await this.taskUserTimeRepository.findOne({ where: { taskId: taskId }, order: { date: 'DESC', remaining: 'DESC' } });
    return result || null;
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
