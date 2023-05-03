import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { DeepPartial, In, EntityManager, IsNull, QueryFailedError } from 'typeorm';


import { PlanningPokerRound } from './planning-poker-round.entity';
import { PlanningPokerVote } from './planning-poker-vote.entity';
import { ProjectService } from '../project/project.service';
import { Story } from './story.entity';
import { StoryService } from './story.service';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class PlanningPokerService {
  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly projectService: ProjectService,
    private readonly storyService: StoryService,
  ) {}

  async getRoundsForStory(storyId: number): Promise<PlanningPokerRound[]> {
    return await this.entityManager.find(PlanningPokerRound, { where: { storyId: storyId }, order: { dateStarted: 'ASC' }});
  }

  async getRoundById(roundId: number, showVotes: boolean = false): Promise<PlanningPokerRound> {
    return await this.entityManager.findOne(PlanningPokerRound, { where: { id: roundId }, relations: ((showVotes) ? ['votes', 'votes.user'] : []) });
  }

  async getActiveRoundForStory(storyId: number, showVotes: boolean = false): Promise<PlanningPokerRound | null> {
    return await this.entityManager.findOne(PlanningPokerRound, { where: { storyId: storyId, dateEnded: IsNull() }, relations: ((showVotes) ? ['votes', 'votes.user'] : []) });
  }

  async getStoryIdForRoundById(roundId: number): Promise<number | null> {
    const result = await this.entityManager.findOneBy(PlanningPokerRound, { id: roundId });
    if (!result)
      return null;
    return result.storyId;
  }

  async startRound(storyId: number): Promise<void> {
    // Check if any round is stil open
    const openRound = await this.getActiveRoundForStory(storyId);
    if (openRound)
      throw new ValidationException('Round already opened for story');

    await this.entityManager.insert(PlanningPokerRound, { storyId: storyId });
  }

  async endRound(roundId: number): Promise<void> {
    const round = await this.getRoundById(roundId, true);
    if (!round)
      throw new ValidationException('Round not exist or not opened');

    // Silently ignore, because round already ended
    if (round.dateEnded)
      return;

    // Close round
    await this.entityManager.update(PlanningPokerRound, { id: roundId }, { dateEnded: () => 'NOW()' });
  }

  async applyResultOfRound(roundId: number): Promise<void> {
    const round = await this.getRoundById(roundId, true);
    if (!round || !round.dateEnded)
      throw new ValidationException('Round not exist or not ended');

    let avg: number = round.votes.reduce((accumulator, value) => accumulator += value.value, 0) / round.votes.length;
    await this.entityManager.update(Story, { id: round.storyId }, { timeComplexity: avg });
  }

  async getVoteInRound(roundId: number, userId: number): Promise<PlanningPokerVote> {
    return await this.entityManager.findOneBy(PlanningPokerVote, { roundId: roundId, userId: userId });
  }

  async getVoteCountForRound(roundId: number): Promise<number> {
    return await this.entityManager.countBy(PlanningPokerVote, { roundId: roundId });
  }

  async voteInRound(roundId: number, userId: number, value: number): Promise<void> {
    const round = await this.getRoundById(roundId);
    if (!round || round.dateEnded)
      throw new ValidationException('Round not exist or not opened');

    // Check if everybody voted and close round
    const projectId: number = await this.storyService.getStoryProjectId(round.storyId);
    if (!projectId)
      throw new ValidationException('Invalid project ID');

    if (!await this.projectService.hasUserRoleOnProject(projectId, userId, [UserRole.Developer]))
      throw new ValidationException('Only developers can vote');

    await this.entityManager.upsert(PlanningPokerVote, { roundId: roundId, userId: userId, value: value }, ['roundId', 'userId']);
    
    const developerCount: number = await this.projectService.countUsersWithRoleOnProject(projectId, [UserRole.Developer]);
    const votes: number = await this.getVoteCountForRound(roundId);
    if (votes >= developerCount) // Automatically end round, when everybody voted
      await this.endRound(roundId);
  }

  async hasUserPermissionForRound(userId: number, roundId: number, role: UserRole[] | UserRole | number[] | number | null = null): Promise<boolean> {
    const storyId = await this.getStoryIdForRoundById(roundId);
    if (!storyId)
      return false;
    return await this.storyService.hasUserPermissionForStory(userId, storyId, role);
  }
}
