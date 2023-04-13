import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository } from 'typeorm';

import { Sprint } from './sprint.entity';
import { ValidationException } from '../common/exception/validation.exception';


@Injectable()
export class SprintService {
  private readonly logger: Logger = new Logger(SprintService.name);

  constructor(
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
    
    await this.sprintRepository.insert(sprint);
  }

  async updateSprintById(sprintId: number, sprint: DeepPartial<Sprint>): Promise<void> {
    await this.sprintRepository.update({ id: sprintId }, sprint);
  }

  async deleteSprintById(sprintId: number): Promise<void> {
    await this.sprintRepository.delete({ id: sprintId });
  }
}
