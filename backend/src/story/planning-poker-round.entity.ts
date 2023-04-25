import { CreateDateColumn, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

import { PlanningPokerVote } from './planning-poker-vote.entity';
import { Story } from './story.entity';

@Entity()
export class PlanningPokerRound {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true })
  storyId: number;

  @ManyToOne(type => Story, story => story.planningPokerRounds, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  story: Story;

  @CreateDateColumn()
  dateStarted: string;

  @Column({ type: 'datetime', nullable: true })
  dateEnded: string;

  @OneToMany(type => PlanningPokerVote, vote => vote.round)
  votes: PlanningPokerVote[];
}