import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { Project } from './project.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class ProjectService {
  private readonly logger: Logger = new Logger(ProjectService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) { }

  async getAllProjects(): Promise<Project[]> {
    return await this.projectRepository.find();
  }

  async getProjectCount(): Promise<number> {
    return await this.projectRepository.count();
  }

  async getProjectById(projectId: number): Promise<Project> {
    return await this.projectRepository.findOneBy({ id: projectId });
  }

  async createProject(project): Promise<object> {
    try {
      this.logger.error(project.projectName);
      let p = new Project();
      p.projectname = project.projectName;
      
      return await (await this.projectRepository.insert(p)).identifiers[0]
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Projectname already exists');
        }
      }
    }
  }

  async updateProjectById(projectId: number, project: DeepPartial<Project>) {
    try {
      await this.projectRepository.update({ id: projectId }, project);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Project name already exists');
        }
      }
    }
  }

  async deleteProjectById(projectId: number) {
    await this.projectRepository.delete({ id: projectId });
  }
}
