import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository, QueryFailedError } from 'typeorm';

import { Story } from './story.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class StoryService {
  private readonly logger: Logger = new Logger(StoryService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
  ) {}

  async getAllStories(): Promise<Story[]> {
    return await this.storyRepository.find();
  }

  async getStoryById(storyId: number): Promise<Story> {
    return await this.storyRepository.findOneBy({ id: storyId });
  }

  async createStory(story) {
    try {
      await this.storyRepository.insert(story);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Storyname already exists');
        }
      }
    }
  }

  async updateStoryById(storyId, story) {
    try {
      await this.storyRepository.update({ id: storyId }, story);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Storyname already exists');
        }
      }
    }
  }

  async deleteStoryById(storyId: number) {
    await this.storyRepository.delete({ id: storyId });
  }
}
