import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { Project } from './project.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { CreateProjectDto } from './dto/create-project.dto';

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

  async createProject(project: CreateProjectDto): Promise<object> {
    try {
      let newProject = this.createProjectObject(project);
      const inserted = await this.projectRepository.insert(newProject);
      return inserted.identifiers[0];
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ConflictException('Project with this name already exists! Please chose a new one.');
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

  createProjectObject(project: CreateProjectDto): Project {
    let newProject = new Project();
    newProject.projectname = project.projectName;

    return newProject;
  }
}
