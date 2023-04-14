import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';

import { UserRole } from '../project/project-user-role.entity';
import { ProjectService } from '../project/project.service';
import { Sprint } from './sprint.entity';
import { ValidationException } from '../common/exception/validation.exception';


@Injectable()
export class SprintService {
  private readonly logger: Logger = new Logger(SprintService.name);

  constructor(
    private readonly projectService: ProjectService,
    @InjectRepository(Sprint)
    private readonly sprintRepository: Repository<Sprint>,
  ) {}

  async listSprintsForProject(projectId: number): Promise<Sprint[]> {
    return await this.sprintRepository.findBy({ projectId: projectId });
  }

  async getSprintById(sprintId: number): Promise<Sprint> {
    return await this.sprintRepository.findOneBy({ id: sprintId });
  }

  async createSprint(projectId: number, sprint: DeepPartial<Sprint>): Promise<void> {
    sprint.projectId = projectId;
    
    // Check if end is after start
    if (sprint.endDate < sprint.startDate)
      throw new ValidationException('End date is before start date');

    // Only one sprint can be at same time
    if (await this.getOverlapingSprint(projectId, sprint.startDate, sprint.endDate) !== null)
      throw new ValidationException('Sprint date overlaps with one of other sprints');

    await this.sprintRepository.insert(sprint);
  }

  async updateSprintById(sprintId: number, sprint: DeepPartial<Sprint>): Promise<void> {
    // Check if end is after start
    if (sprint.startDate || sprint.endDate) {
      const sprintRecord = await this.sprintRepository.findOneBy({ id: sprintId });
      if (!sprintRecord)
        throw new ValidationException('Invalid sprint ID');
      if ((sprint.endDate || sprintRecord.endDate) < (sprint.startDate || sprintRecord.startDate))
        throw new ValidationException('End date is before start date');

      // Only one sprint can be at same time
      if (await this.getOverlapingSprint(sprintRecord.projectId, sprint.startDate || sprintRecord.startDate, sprint.endDate || sprintRecord.endDate, sprintId) !== null)
        throw new ValidationException('Sprint date overlaps with one of other sprints');
    }
    
    await this.sprintRepository.update({ id: sprintId }, sprint);
  }

  async deleteSprintById(sprintId: number): Promise<void> {
    await this.sprintRepository.delete({ id: sprintId });
  }

  async getOverlapingSprint(projectId: number, startDate: string, endDate: string, excludeSprints: number | number[] = []): Promise<Sprint | null> {
    if (!Array.isArray(excludeSprints))
      excludeSprints = [excludeSprints];
    
    return await this.sprintRepository.createQueryBuilder('sprint')
      .select()
      .where(`sprint.projectId = :projectId ${(excludeSprints.length > 0) ? 'AND sprint.id NOT IN (:...sprintIds)' : ''}`, { projectId: projectId, sprintIds: excludeSprints })
      .andWhere(`(sprint.startDate <= :startDate AND sprint.endDate >= :endDate) OR
              (sprint.startDate >= :startDate AND sprint.startDate <= :endDate) OR
              (sprint.endDate >= :startDate AND sprint.endDate <= :endDate)`,
              { startDate: startDate, endDate: endDate })
      .getOne();
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
