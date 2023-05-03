import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, In, Repository, QueryFailedError } from 'typeorm';
import * as moment from 'moment';

import { ProjectService } from '../project/project.service';
import { Sprint } from '../sprint/sprint.entity';
import { StoryService } from '../story/story.service';
import { Task, TaskCategory } from './task.entity';
import { TaskUserTime } from './task-user-time.entity';
import { User } from '../user/user.entity';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { SprintService } from '../sprint/sprint.service';

interface BurndownChartData {
  remaining: number;
  days: {
    date: string;
    spent: number;
    remaining: number;
  }[];
}

class TaskDate extends Task {
  dateWorkStart: string | null;
  dateWorkEnd: string | null;

  time: {
    date: string;
    remaining: number;
    spent: number;
  }[];
}

interface UserTaskStatistics {
  id: number;
  firstName: string;
  lastName: string;
  taskCount: number;
  spent: number;
  byPriority: {
    priority: number;
    taskCount: number;
    spent: number;
  }[];
}

@Injectable()
export class TaskService {
  private readonly logger: Logger = new Logger(TaskService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly projectService: ProjectService,
    private readonly sprintService: SprintService,
    private readonly storyService: StoryService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskUserTime)
    private readonly taskUserTimeRepository: Repository<TaskUserTime>,
  ) { }

  async getTasksForStory(storyId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { storyId: storyId, deleted: false }, relations: ['assignedUser'] });
  }

  async getTaskCategoryCoundForStory(storyId: number): Promise<{ count: { category: number, count: number }[], finished: boolean }> {
    let result = await this.taskRepository.createQueryBuilder('task')
      .select('task.category, COUNT(task.category) AS count')
      .where('task.storyId = :storyId AND task.deleted = 0', { storyId: storyId })
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

  async getDetailedTasksForProject(projectId: number): Promise<TaskDate[]> {
    return (await this.taskRepository.createQueryBuilder('task')
      .innerJoinAndSelect('task.story', 'story', 'task.storyId = story.id')
      .leftJoinAndSelect('story.sprintStories', 'ss', 'ss.storyId = story.id')
      .leftJoinAndSelect('ss.sprint', 'sprint', 'ss.sprintId = sprint.id')
      .leftJoinAndSelect('task.userTime', 'time', 'time.taskId = task.id')
      .where('story.projectId = :projectId', { projectId: projectId })
      .orderBy({ 'task.id': 'ASC', 'sprint.startDate': 'ASC', 'time.date': 'ASC' })
      .distinct(true)
      .getMany()).map((task: Task) => {
        const t = <TaskDate>task;
        t.dateWorkStart = null;
        t.dateWorkEnd = null;
        t.time = [];

        // Get start & end work date for task
        const sprints: Sprint[] = []; // Already ordered by date
        for (const ss of task.story.sprintStories) {
          if (sprints.findIndex((sprint) => sprint.id === ss.sprintId) === -1)
            sprints.push(ss.sprint);
        }
        if (sprints.length > 0) {
          t.dateWorkStart = sprints[0].startDate;
          t.dateWorkEnd = sprints[sprints.length - 1].endDate;
        }

        // Merge user work times by date
        let found: boolean;
        for (const timeRecord of task.userTime) {
          found = false;
          for (let i = 0; i < t.time.length; i++) {
            if (t.time[i].date === timeRecord.date) {
              found = true;
              t.time[i].remaining += timeRecord.remaining;
              t.time[i].spent += timeRecord.spent;
              break;
            }
          }
          if (!found) {
            t.time.push({
              date: timeRecord.date,
              remaining: timeRecord.remaining,
              spent: timeRecord.spent,
            });
          }
        }

        return t;
      });
  }

  async getTasksForSprint(sprintId: number): Promise<Task[]> {
    const storyIds: number[] = await this.storyService.getStoryIdsForSprint(sprintId);

    return await this.taskRepository.find({ where: { storyId: In(storyIds), deleted: false }, relations: ['assignedUser'] });
  }

  async getTasksForUser(userId: number): Promise<Task[]> {
    return await this.taskRepository.find({ where: { assignedUserId: userId, deleted: false }, relations: ['story'] });
  }

  async getTaskById(taskId: number): Promise<Task> {
    return await this.taskRepository.findOne({ where: { id: taskId, deleted: false }, relations: ['assignedUser'] });
  }

  async getStoryIdForTaskById(taskId: number): Promise<number | null> {
    const result = await this.taskRepository.findOne({ where: { id: taskId, deleted: false }, select: ['storyId'] });
    return result?.storyId || null;
  }

  async taskExists(taskId: number): Promise<boolean> {
    return await this.taskRepository.countBy({ id: taskId, deleted: false }) > 0;
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
      throw new ValidationException('Time remaining too big');

    await this.taskRepository.update({ id: taskId, deleted: false }, task);
  }

  async deleteTask(taskId: number): Promise<void> {
    // Check if task is part of active sprint
    if (!await this.isTaskInActiveSprint(taskId))
      throw new ValidationException('Task not in active sprint');

    // Delete task if it hasn't got work logged
    if (!await this.hasTaskGotWork(taskId)) {
      await this.taskRepository.delete({ id: taskId });
      return;
    }
    
    await this.taskRepository.update({ id: taskId, deleted: false }, { deleted: true });
  }

  async getTaskProjectId(taskId: number): Promise<number | null> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, deleted: false }, relations: ['story']});
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
    let elapsed = +(moment().diff(moment((<Date><unknown>task.dateActive).toISOString().replace('Z', '')), 's') / 3600.0); // Because problems with dates
    elapsed = +(Math.ceil(elapsed * 100) / 100).toFixed(2); // Round up to 2 decimal places
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

  async closeTask(taskId: number): Promise<void> {
    // Allow to stop timing after sprint isn't active anymore

    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if ([TaskCategory.ACCEPTED, TaskCategory.ASSIGNED, TaskCategory.UNASSIGNED].includes(task.category))
      throw new ValidationException('Task can\'t be closed');

    await this.taskRepository.update({ id: taskId }, {
      category: TaskCategory.ENDED,
      dateActive: null, // Override if set
      dateEnded: () => 'NOW()',
    });
  }

  async reopenTask(taskId: number, accept: boolean = false): Promise<void> {
    const task = await this.getTaskById(taskId);
    if (!task)
      throw new ValidationException('Invalid task id');
    if (task.category !== TaskCategory.ENDED)
      throw new ValidationException('Task is not closed');
    
    await this.taskRepository.update({ id: taskId }, {
      category: (task.assignedUserId) ? ((accept) ? TaskCategory.ACCEPTED : TaskCategory.ASSIGNED) : TaskCategory.UNASSIGNED,
      dateAccepted: () => (accept) ? 'NOW()' : 'NULL',
      dateAssigned: () => (task.assignedUserId) ? 'NOW()' : 'NULL',
      dateEnded: null,
    });
  }

  async isTaskInActiveSprint(taskId: number): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId) // Task does not exit
      return false;
    return await this.storyService.isStoryInActiveSprint(storyId);
  }

  async hasBeenTaskInActiveSprint(taskId: number, date: string) {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId) // Task does not exit
      return false;
    return await this.storyService.hasBeenStoryInActiveSprint(storyId, date);
  }

  async hasUserPermissionForTask(userId: number, taskId: number, role: UserRole[] | UserRole | number[] | number | null = null): Promise<boolean> {
    const storyId = await this.getStoryIdForTaskById(taskId);
    if (!storyId)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, storyId, role);
  }

  async hasTaskGotWork(taskId: number): Promise<boolean> {
    return await this.taskUserTimeRepository.countBy({ taskId: taskId }) > 0;
  }

  async getWorkOnTask(taskId: number): Promise<TaskUserTime[]> {
    if (!await this.taskExists(taskId))
      return [];
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId }, relations: ['user'], order: { 'date': 'ASC' }})
  }

  async getWorkOnTaskForUser(taskId: number, userId: number): Promise<TaskUserTime[]> {
    if (!await this.taskExists(taskId))
      return [];
    return await this.taskUserTimeRepository.find({ where: { taskId: taskId, userId: userId }, order: { 'date': 'ASC' }})
  }

  async getWorkOnTaskForUserByDate(taskId: number, userId: number, date: string): Promise<TaskUserTime | null> {
    if (!await this.taskExists(taskId))
      return null;
    const result = await this.taskUserTimeRepository.findOneBy({ taskId: taskId, userId: userId, date: date });
    return result || null;
  }

  async getLastWorkOnTask(taskId: number): Promise<TaskUserTime | null> {
    if (!await this.taskExists(taskId))
      return null;
    const result = await this.taskUserTimeRepository.findOne({ where: { taskId: taskId }, order: { date: 'DESC', remaining: 'DESC' } });
    return result || null;
  }

  async setWorkOnTask(date: string, taskId: number, userId: number, work: DeepPartial<TaskUserTime>): Promise<void> {
    if (!await this.taskExists(taskId))
      throw new ValidationException('Task does not exist');

    // We can't enter work for future
    if (moment(date, 'YYYY-MM-DD').isAfter(moment(), 'd'))
      throw new ValidationException('Can\'t enter work on task for future');

    work.date = date;
    work.taskId = taskId;
    work.userId = userId;
    await this.taskUserTimeRepository.upsert(work, ['date', 'taskId', 'userId']);
  }

  async removeWorkOnTask(date: string, taskId: number, userId: number): Promise<void> {
    if (!await this.taskExists(taskId))
      throw new ValidationException('Task does not exist');
    await this.taskUserTimeRepository.delete({ date: date, taskId: taskId, userId: userId });
  }

  async getBurndownChartDataForProjectByProjectId(projectId: number): Promise<BurndownChartData> {
    const sprints: Sprint[] = await this.sprintService.listSprintsForProject(projectId);
    if (sprints.length < 1)
      throw new ValidationException('Project hasn\'t got any sprint');

    const projectStartDate: string = sprints[0].startDate;
    const projectEndDate: string = sprints[sprints.length - 1].endDate;

    const data = {
      remaining: 0,
      days: [],
    };

    const tasks: TaskDate[] = await this.getDetailedTasksForProject(projectId);

    // Calculate sum of initial estimate for all tasks
    for (const task of tasks)
      data.remaining += task.remaining;

    // Calculate for each day
    let remaining: number, spent: number;
    let workStart: moment.Moment, workEnd: moment.Moment;
    for (let d = moment(projectStartDate, 'YYYY-MM-DD'); d.isSameOrBefore(moment(projectEndDate, 'YYYY-MM-DD')); d.add(1, 'd')) {
      // Reset count values
      remaining = 0;
      spent = 0;

      // Go over each task
      for (const task of tasks) {
        if (task.dateWorkStart === null || task.dateWorkEnd === null || task.userTime.length < 1) {
          // Always count in remaining, because it could never be done
          remaining += task.remaining; // Add inicial estimate
        } else {
          workStart = moment(task.dateWorkStart, 'YYYY-MM-DD');
          workEnd = moment(task.dateWorkEnd, 'YYYY-MM-DD');
          if (d.isBetween(workStart, workEnd, 'd', '[]')) {
            let lastBeforeSame: { date: string; remaining: number; spent: number; } | null = null;
            for (const userTime of task.time) {
              if (!moment(userTime.date, 'YYYY-MM-DD').isSameOrBefore(d, 'd'))
                break;
              lastBeforeSame = userTime; 
            }
            if (!lastBeforeSame) { // No work done before or on same day that we are calculating for
              remaining += task.remaining; // Add inicial estimate
            } else {
              remaining += lastBeforeSame.remaining; // Add last estimation

              if (moment(lastBeforeSame.date, 'YYYY-MM-DD').isSame(d, 'd')) // If working on the day
                spent += lastBeforeSame.spent; // Increase spent time
            }
          } else if (d.isBefore(workStart, 'd')) { // Before task is in any sprint
            remaining += task.remaining;
          } else if (d.isAfter(workEnd, 'd')) { // After task is over all sprints
            remaining += task.time[task.time.length - 1].remaining; // Add last task remaining estimation
          }
        }
      }

      data.days.push({
        date: d.format('YYYY-MM-DD'),
        remaining: remaining,
        spent: spent,
      });
    }
    return data;
  }

  async getUserStatisticsForProject(projectId: number): Promise<UserTaskStatistics[]> {
    const result = (await this.entityManager.createQueryBuilder(User, 'user')
      .leftJoin('user.taskTime', 'time', 'time.userId = user.id')
      .innerJoin('time.task', 'task', 'time.taskId = task.id')
      .innerJoin('task.story', 'story', 'task.storyId = story.id')
      .select(['user.id AS id', 'user.firstName AS firstName', 'user.lastName AS lastName', 'story.priority AS priority', 'COUNT(DISTINCT time.taskId) AS taskCount', 'SUM(time.spent) AS spent'])
      .where('story.projectId = :projectId', { projectId: projectId })
      .orderBy({ 'user.lastName': 'ASC', 'user.firstName': 'ASC' })
      .groupBy('id,firstName,lastName,priority')
      .getRawMany()).map((user) => {
        user.taskCount = +user.taskCount;
        return user;
      });
    const data: UserTaskStatistics[] = [];
    let found: boolean = false;
    for (const record of result) {
      found = false;
      for (let i = 0; i < data.length; i++) {
        if (data[i].id === record.id) {
          found = true;
          data[i].taskCount += record.taskCount;
          data[i].spent += record.spent;
          data[i].byPriority.push({
            priority: record.priority,
            taskCount: record.taskCount,
            spent: record.spent,
          });
          break;
        }
      }
      if (!found) {
        data.push({
          id: record.id,
          firstName: record.firstName,
          lastName: record.lastName,
          taskCount: record.taskCount,
          spent: record.spent,
          byPriority: [
            {
              priority: record.priority,
              taskCount: record.taskCount,
              spent: record.spent,
            }
          ]
        });
      }
    } 
    return data;
  }
}
