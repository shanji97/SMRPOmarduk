import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, EntityManager, QueryFailedError, Repository } from 'typeorm';
import * as moment from 'moment';
import { ProjectService } from '../project/project.service';
import { Sprint } from './sprint.entity';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { SprintStory } from './sprint-story.entity';

@Injectable()
export class SprintService {
  private readonly logger: Logger = new Logger(SprintService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly projectService: ProjectService,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async listSprintsForProject(projectId: number): Promise<Sprint[]> {
    return await this.sprintRepository.find({ where: { projectId: projectId }, order: { startDate: 'ASC' } });
  }

  async getSprintById(sprintId: number): Promise<Sprint> {
    return await this.sprintRepository.findOneBy({ id: sprintId });
  }

  async createSprint(projectId: number, sprint: DeepPartial<Sprint>): Promise<void> {
    sprint.projectId = projectId;

    // Check if end is after start
    if (sprint.endDate < sprint.startDate)
      throw new ValidationException('End date is before start date');

    // Start date can't be in the past
    if (moment(sprint.startDate, 'YYYY-MM-DD').isBefore(moment()))
      throw new ValidationException('Can\'t start sprint in the past');

    // Check if velocity to high for the sprint
    let sprintDurationDays: number = moment(sprint.endDate, 'YYYY-MM-DD').diff(moment(sprint.startDate, 'YYYY-MM-DD'), 'd') + 1;
    if (sprintDurationDays > 6) {
      const weekends = sprintDurationDays / 7; // Calculate weekends TODO: improve
      sprintDurationDays -= (2 * weekends); // substract weekends from working days
    }
    const personHoursPerDay: number = this.configService.get<number>('PERSON_HOURS_PER_DAY');
    const personMaxLoadFactor: number = this.configService.get<number>('PERSON_MAX_LOAD_FACTOR');
    const peopleCount: number = await this.projectService.countUsersWithRoleOnProject(sprint.projectId, [UserRole.Developer, UserRole.ScrumMaster]);
    if (sprint.velocity > sprintDurationDays * peopleCount * personHoursPerDay * personMaxLoadFactor)
      throw new ValidationException('Irregular sprint velocity');
    
    // Only one sprint can be at same time
    if (await this.getOverlappingSprint(projectId, sprint.startDate, sprint.endDate) !== null)
      throw new ValidationException('Sprint date overlaps with one of other sprints');

    await this.sprintRepository.insert(sprint);
  }

  async updateSprintById(sprintId: number, sprint: DeepPartial<Sprint>): Promise<void> {
    const sprintRecord = await this.sprintRepository.findOneBy({ id: sprintId });
    if (!sprintRecord)
      throw new ValidationException('Invalid sprint ID');

    // Can't edit sprints that have already started
    if (moment(sprintRecord.startDate, 'YYYY-MM-DD').isSameOrBefore(moment()))
      throw new ValidationException('Sprint has already started');

    // Check if end is after start
    if (sprint.startDate || sprint.endDate) {
      if ((sprint.endDate || sprintRecord.endDate) < (sprint.startDate || sprintRecord.startDate))
        throw new ValidationException('End date is before start date');

      // Start date can't be in the past
      if (sprint.startDate && moment(sprint.startDate, 'YYYY-MM-DD').isBefore(moment()))
        throw new ValidationException('Can\'t start sprint in the past');

      // End date can't be in the past
      if (sprint.endDate && moment(sprint.endDate, 'YYYY-MM-DD').isBefore(moment()))
        throw new ValidationException('Can\'t end sprint in the past');

      // Only one sprint can be at same time
      if (await this.getOverlappingSprint(sprintRecord.projectId, sprint.startDate || sprintRecord.startDate, sprint.endDate || sprintRecord.endDate, sprintId) !== null)
        throw new ValidationException('Sprint date overlaps with one of other sprints');
    }

    if (sprint.startDate || sprint.endDate || sprint.velocity) {
      let sprintDurationDays: number = moment(sprint.endDate || sprintRecord.endDate, 'YYYY-MM-DD').diff(moment(sprint.startDate || sprintRecord.startDate, 'YYYY-MM-DD'), 'd') + 1;
      if (sprintDurationDays > 6) {
        const weekends = sprintDurationDays / 7; // Calculate weekends TODO: improve
        sprintDurationDays -= (2 * weekends); // substract weekends from working days
      }
      const personHoursPerDay: number = this.configService.get<number>('PERSON_HOURS_PER_DAY');
      const personMaxLoadFactor: number = this.configService.get<number>('PERSON_MAX_LOAD_FACTOR');
      const peopleCount: number = await this.projectService.countUsersWithRoleOnProject(sprint.projectId || sprintRecord.projectId, [UserRole.Developer, UserRole.ScrumMaster]);
      if (sprint.velocity > sprintDurationDays * peopleCount * personHoursPerDay * personMaxLoadFactor)
        throw new ValidationException('Irregular sprint velocity');
    }
    
    await this.sprintRepository.update({ id: sprintId }, sprint);
  }

  async deleteSprintById(sprintId: number): Promise<void> {
    await this.sprintRepository.delete({ id: sprintId });
  }

  async getOverlappingSprint(projectId: number, startDate: string, endDate: string, excludeSprints: number | number[] = []): Promise<Sprint | null> {
    if (!Array.isArray(excludeSprints))
      excludeSprints = [excludeSprints];

    return await this.sprintRepository.createQueryBuilder('sprint')
      .select()
      .where(`sprint.projectId = :projectId ${(excludeSprints.length > 0) ? 'AND sprint.id NOT IN (:...sprintIds)' : ''}`, { projectId: projectId, sprintIds: excludeSprints })
      .andWhere(`((sprint.startDate <= :startDate AND sprint.endDate >= :endDate) OR
              (sprint.startDate >= :startDate AND sprint.startDate <= :endDate) OR
              (sprint.endDate >= :startDate AND sprint.endDate <= :endDate))`,
              { startDate: startDate, endDate: endDate })
      .getOne();
  }

  async addStoryToSprint(sprintId: number, storyId: number) {
    await this.entityManager.insert(SprintStory, {
      sprintId: sprintId,
      storyId: storyId
    });
  }

  async hasUserPermissionForSprint(userId: number, sprintId: number): Promise<boolean> {
    const sprint = await this.sprintRepository.findOneBy({ id: sprintId });
    if (!sprint)
      return false;
    return await this.projectService.hasUserRoleOnProject(sprint.projectId, userId, [UserRole.Developer, UserRole.ScrumMaster]);
  }

  async hasUserEditPermissionForSprint(userId: number, sprintId: number): Promise<boolean> {
    const sprint = await this.sprintRepository.findOneBy({ id: sprintId });
    if (!sprint)
      return false;
    return await this.projectService.hasUserRoleOnProject(sprint.projectId, userId, UserRole.ScrumMaster);
  }
}
