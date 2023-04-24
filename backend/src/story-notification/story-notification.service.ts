import { ConflictException, Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError, EntityManager, Not } from 'typeorm';
import { NotificationStatus, StoryNotification } from './story-notification.entity';

@Injectable()
export class StoryNotificationService {
    private readonly logger: Logger = new Logger(StoryNotificationService.name);

    constructor(
        @InjectRepository(StoryNotification)
        private readonly storyNotificationRepository: Repository<StoryNotification>,
        @InjectEntityManager()
        private readonly entityManager: EntityManager,
    ) { }

    async getAllNotifications(): Promise<StoryNotification[]> {
        return await this.storyNotificationRepository.find();
    }

    async getNotificationById(storyNotificationId: number): Promise<StoryNotification> {
        return await this.storyNotificationRepository.findOneBy({ id: storyNotificationId })
    }

    async getStoryRejectionsByStoryId(storyId: number): Promise<StoryNotification[]> {
        return await this.storyNotificationRepository.findBy({ storyId: storyId, notificationType: Not(NotificationStatus.Rejected) });
    }

    // async approveNotifications(storyNotificationId: number) {
    //     return await this.storyNotificationRepository.update(id: storyNotificationId }, { approved: true })
    // }

    async setRejectionDescription(description: string, userId: number, stroyId: number) {
        let newRejectionNotification: StoryNotification = this.createNotification(description, userId, stroyId);
        await this.storyNotificationRepository.insert(newRejectionNotification);
    };
    // async createStory(story: CreateStoryDto, projectId: number): Promise<object> {
    //     try {
    //         let newStory = this.createStoryObject(story, projectId);
    //         const inserted = await this.storyRepository.insert(newStory);
    //         return inserted.identifiers[0];
    //     } catch (ex) {
    //         if (ex instanceof QueryFailedError) {
    //             switch (ex.driverError.errno) {
    //                 case 1062: // Duplicate entry
    //                     const storyByTitle = await this.getStoryByTitleAndProjectId(story.title, projectId);
    //                     if (storyByTitle != null) {
    //                         throw new ConflictException('Story by this name already exists!');
    //                     }
    //                     throw new ConflictException('Please add a new sequence number for this story.');
    //             }
    //         }
    //     }
    // }

    // async updateStoryCategory(storyId: number, category: number) {
    //     await this.storyRepository.update({ id: storyId }, { category: category });
    // }

    // async updateStoryTimeComplexity(storyId: number, timeComplexity: number) {
    //     await this.storyRepository.update({ id: storyId }, { timeComplexity: timeComplexity });
    // }

    // async updateStoryById(storyId: number, story: UpdateStoryDto) {
    //     try {
    //         let existingStory = await this.getStoryById(storyId);
    //         await this.storyRepository.update({ id: storyId }, await this.updateStoryData(story, existingStory));
    //     } catch (ex) {
    //         if (ex instanceof QueryFailedError) {
    //             switch (ex.driverError.errno) {
    //                 case 1062: // Duplicate entry
    //                     throw new ValidationException('Story name already exists');
    //             }
    //         }
    //     }
    // }

    // async deleteStoryById(storyId: number) {
    //     await this.storyRepository.delete({ id: storyId });
    // }

    // async deleteStory(story: Story) {
    //     await this.storyRepository.delete(story);
    // }

    // async getStoryByTitleAndProjectId(title: string, projectId: number): Promise<Story> {
    //     return await this.storyRepository.findOneBy({ title: title, projectId: projectId });
    // }

    // async getStoryBySequenceNumberAndProjectId(sequenceNumber: number, projectId: number): Promise<Story> {
    //     return await this.storyRepository.findOneBy({ sequenceNumber: sequenceNumber, projectId: projectId });
    // }

    // async getStoryByTitle(title: string): Promise<Story> {
    //     return this.storyRepository.findOneBy({ title: title });
    // }

    // async getStoryProjectId(storyId: number): Promise<number | null> {
    //     const story = await this.storyRepository.findOneBy({ id: storyId });
    //     if (!story)
    //         return null;
    //     return story.projectId;
    // }

    // async isStoryInSprint(storyId: number): Promise<boolean> {
    //     return await this.entityManager.count(SprintStory, {
    //         where: { storyId: storyId }
    //     }) > 0;
    // }

    createNotification(description: string, userId: number, storyId: number): StoryNotification {
        let newStoryNotification = new StoryNotification();
        newStoryNotification.notificationText = description;
        newStoryNotification.userId = userId;
        newStoryNotification.storyId = storyId;
        return newStoryNotification;
    }

    // async updateStoryData(story: UpdateStoryDto, existingStory: Story): Promise<Story> {
    //     existingStory.title = story.title;
    //     existingStory.description = story.description;
    //     existingStory.sequenceNumber = story.sequenceNumber;
    //     existingStory.priority = story.priority;
    //     existingStory.businessValue = story.businessValue;
    //     return existingStory;
    // }

    // async checkStoryProperties(story: Story) {
    //     if (!story) {
    //         throw new NotFoundException('The story was not found.');
    //     }
    //     if (story.isRealized)
    //         throw new BadRequestException('A realized story cannot be deleted.');

    //     if (await this.isStoryInSprint(story.id))
    //         throw new BadRequestException('The story has been already added to sprint.');
    // }

    // async hasUserPermissionForStory(userId: number, storyId: number, userRole: UserRole[] | UserRole | number | null = null): Promise<boolean> {
    //     const projectId = await this.getStoryProjectId(storyId);
    //     if (!projectId)
    //         return false;

    //     return await this.projectService.hasUserRoleOnProject(projectId, userId, userRole); // If user has any role on project, he can view it
    // }

    // async isStoryInActiveSprint(storyId: number): Promise<boolean> {
    //     const count = await this.storyRepository.createQueryBuilder('st')
    //         .innerJoin(SprintStory, 'ss', 'ss.storyId = st.id')
    //         .innerJoin(Sprint, 'sp', 'sp.id = ss.sprintId')
    //         .where('st.id = :storyId AND sp.startDate <= NOW() AND sp.endDate >= NOW()', { storyId: storyId })
    //         .getCount();
    //     return count > 0;
    // }

    // async getStoryIdsForSprint(sprintId: number): Promise<number[]> {
    //     return (await this.entityManager.findBy(SprintStory, { sprintId: sprintId })).map(ss => ss.storyId);
    // }
}