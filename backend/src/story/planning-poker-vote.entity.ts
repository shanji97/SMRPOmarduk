import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { PlanningPokerRound } from './planning-poker-round.entity';
import { User } from '../user/user.entity';

@Entity()
export class PlanningPokerVote {
  @PrimaryColumn({ unsigned: true })
  roundId: number;

  @ManyToOne(type => PlanningPokerRound, round => round.votes, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  round: PlanningPokerRound;

  @PrimaryColumn({ unsigned: true })
  userId: number;

  @ManyToOne(type => User, user => user.planningPockerVotes, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  dateCreated: string;

  @UpdateDateColumn()
  dateUpdated: string;

  @Column({ type: 'float' })
  value: number;
}
