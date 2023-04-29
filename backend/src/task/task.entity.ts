import { Entity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';

import { Story } from '../story/story.entity';
import { TaskUserTime } from './task-user-time.entity';
import { User } from '../user/user.entity';

export enum TaskCategory {
  UNKNOWN = 0,
  UNASSIGNED = 1,
  ASSIGNED = 2,
  ACCEPTED = 3,
  ACTIVE = 4,
  ENDED = 250,
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'tinyint', unsigned: true, default: TaskCategory.UNASSIGNED })
  category: number;

  @Column({ type: 'float', unsigned: true })
  remaining: number; // estimate remaining work in houtrs

  @Column({ type: 'datetime', default: null })
  dateAssigned: string;

  @Column({ type: 'datetime', default: null })
  dateAccepted: string;

  @Column({ type: 'datetime', default: null })
  dateActive: string;

  @Column({ type: 'datetime', default: null })
  dateEnded: string;

  @CreateDateColumn()
  dateCreated: string;

  @UpdateDateColumn()
  dateUpdated: string;

  @Column({ type: 'tinyint', default: false })
  deleted: boolean;

  @Column({ unsigned: true })
  storyId: number;

  @ManyToOne(type => Story, story => story.tasks, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  story: Story;

  @Column({ unsigned: true, nullable: true })
  assignedUserId: number | null;

  @ManyToOne(type => User, user => user.tasks, { onUpdate: 'CASCADE', onDelete: 'SET NULL' })
  assignedUser: User | null;

  @OneToMany(type => TaskUserTime, userTime => userTime.task)
  userTime: TaskUserTime[];
}
