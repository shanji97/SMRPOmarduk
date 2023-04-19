import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { ProjectService } from '../project/project.service';
import { Story } from './story.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { CreateStoryDto } from './dto/create-story.dto';
import { UserRole } from '../project/project-user-role.entity';

@Injectable()
export class StoryService {
  private readonly logger: Logger = new Logger(StoryService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly projectService: ProjectService,
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
  ) { }

  async getAllStories(): Promise<Story[]> {
    return await this.storyRepository.find();
  }

  async getStoryById(storyId: number): Promise<Story> {
    return await this.storyRepository.findOneBy({ id: storyId });
  }

  async createStory(story: CreateStoryDto, projectId: number): Promise<object> {
    try {
      let newStory = this.createStoryObject(story, projectId);
      const inserted = await this.storyRepository.insert(newStory);
      return inserted.identifiers[0];
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            const storyByTitle = await this.getStoryByTitleAndProjectId(story.title, projectId);
            if (storyByTitle != null) {
              throw new ConflictException('Story by this name already exists!');
            }
            throw new ConflictException('Please add a new sequence number for this story.');
        }
      }
    }
  }

  async updateStoryById(storyId, story) {
    try {
      await this.storyRepository.update({ id: storyId }, story);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Storyname already exists');
        }
      }
    }
  }

  async deleteStoryById(storyId: number) {
    await this.storyRepository.delete({ id: storyId });
  }

  async getStoryByTitleAndProjectId(title: string, projectId: number): Promise<Story> {
    return await this.storyRepository.findOneBy({ title: title, projectId: projectId });
  }

  async getStoryBySequenceNumberAndProjectId(sequenceNumber: number, projectId: number): Promise<Story> {
    return await this.storyRepository.findOneBy({ sequenceNumber: sequenceNumber, projectId: projectId });
  }

  async getStoryByTitle(title: string): Promise<Story> {
    return this.storyRepository.findOneBy({ title: title });
  }

  async getStoryProjectId(storyId: number): Promise<number | null> {
    const story = await this.storyRepository.findOneBy({ id: storyId });
    if (!story)
      return null;
    return story.projectId;
  }

  createStoryObject(story: CreateStoryDto, projectId: number): Story {
    let newStory = new Story();
    newStory.projectId = projectId;
    newStory.title = story.title;
    newStory.description = story.description;
    newStory.sequenceNumber = story.sequenceNumber;
    newStory.priority = story.priority;
    newStory.businessValue = story.businessValue;
    return newStory;
  }

  async hasUserPermissionForStory(userId: number, storyId: number, userRole: UserRole[] | UserRole | number | null = null): Promise<boolean> {
    const projectId = await this.getStoryProjectId(storyId);
    if (!projectId)
      return false;
    
    return await this.projectService.hasUserRoleOnProject(projectId, userId, userRole); // If user has any role on project, he can view it
  }

  async isStoryInActiveSprint(storyId: number): Promise<boolean> {
    return true; // TODO: Implement query when many to many relation will be implemented
  }

  async getStoryIdsForSprint(sprintId: number): Promise<number[]> {
    return []; // TODO: Implement query when many to many relation will be implemented
  }
}
