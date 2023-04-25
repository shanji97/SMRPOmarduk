import { ConflictException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, EntityManager, DeepPartial } from 'typeorm';
import { CreateStoryDto } from './dto/create-story.dto';
import { ProjectService } from '../project/project.service';
import { Sprint } from '../sprint/sprint.entity';
import { SprintStory } from '../sprint/sprint-story.entity';
import { Story, Category } from './story.entity';
import { UpdateStoryDto } from './dto/update-story.dto';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class StoryService {
  private readonly logger: Logger = new Logger(StoryService.name);

  constructor(
    private readonly projectService: ProjectService,
    @InjectRepository(Story)
    private readonly storyRepository: Repository<Story>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) { }

  async getAllStories(): Promise<Story[]> {
    return await this.storyRepository.find();
  }

  async getStoryById(storyId: number): Promise<Story> {
    return await this.storyRepository.findOne({ where: { id: storyId }, relations: ['assignedUser'] });
  }

  async getStoriesByUserId(userId: number): Promise<Story[]>{
    return await this.storyRepository.findBy({ userId: userId })
  }

  async getStoriesByAssignedUserId(userId: number): Promise<Story[]>{
    return await this.storyRepository.findBy({ assignedUserId: userId })
  }

  async getStoriesWithTasksByAssignedUserId(userId: number): Promise<Story[]>{
    return await this.storyRepository.find({ where: { assignedUserId: userId }, relations: ['tasks']})
  }

  async getStoriesByProjectId(projectId: number): Promise<Story[]> {
    return await this.storyRepository.find({ where: { projectId: projectId }, relations: ['assignedUser'] })
  }

  async createStory(story: CreateStoryDto, projectId: number, userId : number): Promise<object> {
    try {
      let newStory = this.createStoryObject(story, projectId, userId);
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

  async updateStoryCategory(storyId: number, category: number) {
    await this.storyRepository.update({ id: storyId }, { category: category });
  }

  async updateStoryBacklog(storyId: number, backlog: number) {
    await this.storyRepository.update({ id: storyId }, { backlog: backlog });
  }

  async updateStoryTimeComplexity(storyId: number, timeComplexity: number) {
    await this.storyRepository.update({ id: storyId }, { timeComplexity: timeComplexity });
  }

  async setRealizeFlag(storyId: number, realize: boolean) {
    await this.storyRepository.update({ id: storyId }, { isRealized: realize });
  }

  async updateStoryById(storyId: number, story: UpdateStoryDto) {
    try {
      let existingStory = await this.getStoryById(storyId);

      await this.storyRepository.update({ id: storyId }, { title: story.title, description: story.description, sequenceNumber: story.sequenceNumber, priority: story.priority, businessValue: story.businessValue, assignedUserId: story.assignedUserId });
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch (ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Story name or story with this sequence number already exists.');
        }
      }
    }
  }

  async deleteStoryById(storyId: number) {
    await this.storyRepository.delete({ id: storyId });
  }

  async deleteStory(story: Story) {
    await this.storyRepository.delete(story);
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

  async isStoryFinished(storyId: number): Promise<boolean> {
    const story = await this.storyRepository.findOne({ where: { id: storyId }, select: ['id', 'category'] });
    if (!story)
      return false;
    return story.category == Category.Finished;
  }

  async getStoryProjectId(storyId: number): Promise<number | null> {
    const story = await this.storyRepository.findOneBy({ id: storyId });
    if (!story)
      return null;
    return story.projectId;
  }

  async isStoryInSprint(storyId: number): Promise<boolean> {
    return await this.entityManager.count(SprintStory, {
      where: { storyId: storyId }
    }) > 0;
  }

  createStoryObject(story: CreateStoryDto, projectId: number, userId: number): Story {
    let newStory = new Story();
    newStory.projectId = projectId;
    newStory.title = story.title;
    newStory.description = story.description;
    newStory.sequenceNumber = story.sequenceNumber;
    newStory.priority = story.priority;
    newStory.businessValue = story.businessValue;
    newStory.userId = userId;
    newStory.assignedUserId = story.assignedUserId;
    return newStory;
  }

  async updateStoryData(story: UpdateStoryDto, existingStory: Story): Promise<DeepPartial<Story>> {
    existingStory.title = story.title;
    existingStory.description = story.description;
    existingStory.sequenceNumber = story.sequenceNumber;
    existingStory.priority = story.priority;
    existingStory.businessValue = story.businessValue;
    existingStory.assignedUserId = story.assignedUserId;
    return existingStory;
  }

  async checkStoryProperties(story: Story) {
    if (!story) {
      throw new NotFoundException('The story was not found.');
    }
    if (story.isRealized)
      throw new BadRequestException('A realized story cannot be deleted.');

    if (await this.isStoryInSprint(story.id))
      throw new BadRequestException('The story has been already added to sprint.');
  }

  async hasUserPermissionForStory(userId: number, storyId: number, userRole: UserRole[] | UserRole | number | null = null): Promise<boolean> {
    const projectId = await this.getStoryProjectId(storyId);
    if (!projectId)
      return false;

    return await this.projectService.hasUserRoleOnProject(projectId, userId, userRole); // If user has any role on project, he can view it
  }

  async isStoryInActiveSprint(storyId: number): Promise<boolean> {
    const count = await this.storyRepository.createQueryBuilder('st')
      .innerJoin(SprintStory, 'ss', 'ss.storyId = st.id')
      .innerJoin(Sprint, 'sp', 'sp.id = ss.sprintId')
      .where('st.id = :storyId AND sp.startDate <= NOW() AND sp.endDate >= NOW()', { storyId: storyId })
      .getCount();
    return count > 0;
  }

  async getStoryIdsForSprint(sprintId: number): Promise<number[]> {
    return (await this.entityManager.findBy(SprintStory, { sprintId: sprintId })).map(ss => ss.storyId);
  }
}