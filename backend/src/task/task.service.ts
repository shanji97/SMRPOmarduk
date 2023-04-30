import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
    private readonly configService: ConfigService,
    private readonly projectService: ProjectService,
    private readonly storyService: StoryService,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUserTime)
    private readonly taskUserTimeRepository: Repository<TaskUserTime>,
  ) { }

  async getTasksForStory(storyId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { storyId: storyId }, relations: ['assignedUser'] });
  }

  async getTaskCategoryCoundForStory(storyId: number): Promise<{ count: { category: number, count: number }[], finished: boolean }> {
    let result = await this.taskRepository.createQueryBuilder('task')
      .select('task.category, COUNT(task.category) AS count')
      .where('task.storyId = :storyId', { storyId: storyId })
      .groupBy('task.category')
      .getRawMany();
    result = result.map(category => {
      category.count = +category.count;
      return category;
    });

    const catsum = result.reduce((acc, category) => acc + category.count, 0);
    const finished = result.reduce((acc, category) => (category.category === TaskCategory.ENDED) ? acc + category.count : acc, 0);

    return {
      count: result,
      finished: catsum === finished,
    };
  }

  async getTasksForSprint(sprintId: number): Promise<Task[]> {
    const storyIds: number[] = await this.storyService.getStoryIdsForSprint(sprintId);

    return await this.taskRepository.find({ where: { storyId: In(storyIds) }, relations: ['assignedUser'] });
  }

  async getTasksForUser(userId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { assignedUserId: userId }, relations: ['story'] });
  }

  async getTaskById(taskId: number): Promise<Task> {
    return await this.taskRepository.findOne({ where: { id: taskId }, relations: ['assignedUser'] });
  }

  async getStoryIdForTaskById(taskId: number): Promise<number | null> {
    const result = await this.taskRepository.findOne({ where: { id: taskId }, select: ['storyId'] });
    return result?.storyId || null;
  }

  async createTask(storyId: number, task: DeepPartial<Task>): Promise<number> {
    // Check if we are trying to insert task into active sprint
    if (!await this.storyService.isStoryInActiveSprint(storyId))
      throw new ValidationException('Story not in active sprint');

    task.storyId = storyId;

    if (task.assignedUserId) {
      task.category = TaskCategory.ASSIGNED;
      task.dateAssigned = moment().format('YYYY-MM-DD');
    }
    // Check if story already completed
    if (await this.storyService.isStoryFinished(storyId))
      throw new ValidationException('Story already finished');

    // Check remaining value
    const taskMaxTimeFactor: number = this.configService.get<number>('TASK_MAX_TIME_FACTOR');
    const storyTimeMax = await this.storyService.getTimeComplexityInHoursForStoryById(storyId);
    const maxTime = storyTimeMax * taskMaxTimeFactor;
    if (task.remaining > maxTime)
      throw new ValidationException('Timeremaining too big');

    task.storyId = storyId;
    const result = await this.taskRepository.insert(task);
    return result.raw.insertId || null;
  }

  async updateTask(taskId: number, task: DeepPartial<Task>): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const taskRecord = await this.getTaskById(taskId);

    // Check remaining value
    const taskMaxTimeFactor: number = this.configService.get<number>('TASK_MAX_TIME_FACTOR');
    const storyTimeMax = await this.storyService.getTimeComplexityInHoursForStoryById(taskRecord.storyId);
    const maxTime = storyTimeMax * taskMaxTimeFactor;
    if (task.remaining > maxTime)
      throw new ValidationException('Timeremaining too big');

    await this.taskRepository.update({ id: taskId }, task);
  }

  async deleteTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    await this.taskRepository.delete({ id: taskId });
  }

  async getTaskProjectId(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findOne({ where: { id: taskId }, relations: ['story'] });
    if (!task)
      return null;
    return task.story.projectId;
  }

  async assignTaskToUser(taskId: number, userId: number, override: boolean = false): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category != TaskCategory.UNASSIGNED && !(override && [TaskCategory.ACCEPTED, TaskCategory.ASSIGNED, TaskCategory.UNASSIGNED, TaskCategory.UNKNOWN].includes(task.category)))
      throw new ValidationException('Task is not unassigned');

    // Only users that have role on project, can be assigned to task
    const projectId: number = await this.getTaskProjectId(task.id);
    if (!await this.projectService.hasUserRoleOnProject(projectId, userId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ValidationException('User hasn\'t got role on the project');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ASSIGNED,
      dateAssigned: () => 'NOW()',
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
      dateAccepted: () => 'NOW()',
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

  async getTaskDataForBD(projectId: number): Promise<any> {
    const taskData = await this.taskRepository
      .createQueryBuilder("task")
      .leftJoin("task.story", "story")
      .leftJoinAndSelect("task.userTime", "userTime")
      .where("story.projectId = :projectId", { projectId: projectId })
      .getMany();

    // return taskData.flatMap(task => task.userTime);
    const userTime = taskData.flatMap(task => task.userTime);

    return userTime.reduce((acc, cur) => {
      const key = `${cur.date}`;
      if (!acc[key]) {
        acc[key] = {
          taskId: [],
          spent: 0,
          remaining: 0
        };
      }
      acc[key].taskId.push(cur.taskId),
      acc[key].spent += cur.spent;
      acc[key].remaining += cur.remaining;
      return acc;
    }, {});
  }

  async startTaskTiming(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (await this.storyService.isStoryFinished(task.storyId)) // Check if story is finished
      throw new ValidationException('Story already finished');
    if (task.category == TaskCategory.ACTIVE || task.dateActive)
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
    if (task.category !== TaskCategory.ACTIVE || !task.dateActive)
      throw new ValidationException('Task not active');

    // Add log time record
    let elapsed = +(moment().diff(moment((<Date><unknown>task.dateActive).toISOString().replace('Z', '')), 'm') / 60.0).toFixed(2); // Because problems with dates
    if (elapsed < 0) // Failsafe (calculation error)
      elapsed = 0;
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
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId }, relations: ['user'], order: { 'date': 'ASC' } })
  }

  async getWorkOnTaskForUser(taskId: number, userId: number): Promise<TaskUserTime[]> {
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId, userId: userId }, order: { 'date': 'ASC' } })
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
    // We can't enter work for future
    if (moment(date, 'YYYY-MM-DD').isAfter(moment(), 'd'))
      throw new ValidationException('Can\'t enter work on task for future');

    work.date = date;
    work.taskId = taskId;
    work.userId = userId;
    await this.taskUserTimeRepository.upsert(work, ['date', 'taskId', 'userId']);
  }

  async removeWorkOnTask(date: string, taskId: number, userId: number): Promise<void> {
    await this.taskUserTimeRepository.delete({ date: date, taskId: taskId, userId: userId });
  }
}
