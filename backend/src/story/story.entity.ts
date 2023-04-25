import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';

import { PlanningPokerRound } from './planning-poker-round.entity';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { StoryTest } from '../test/test.entity';
import { SprintStory } from '../sprint/sprint-story.entity';
import { StoryNotification } from '../story-notification/story-notification.entity';
import { User } from 'src/user/user.entity';

export enum Category {
  WontHave = 0,
  Unassigned = 1,
  Assigned = 2,
  Finished = 3,
}

export enum Backlog {
  Product = 0,
  Sprint = 1
}

@Entity()
@Unique(['title', 'projectId'])
@Unique(['sequenceNumber', 'projectId'])
export class Story {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, type: 'int' })
  projectId: number;

  @Column({ unsigned: true, type: 'int'})
  userId: number;

  @Column({ unsigned: true })
  sequenceNumber: number;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'tinyint' })
  priority: number;

  @Column({ type: 'tinyint' })
  businessValue: number;

  @Column({ type: 'tinyint', default: Category.Unassigned })
  category: number;

  @Column({ type: 'tinyint', default: Backlog.Product })
  backlog: number;

  @Column({ type: 'float', default: 0 })
  timeComplexity: number

  @Column({ type: 'boolean', default: false })
  isRealized: boolean;

  @OneToMany(type => Task, task => task.story)
  tasks: Task[];

  @OneToMany(type => StoryTest, test => test.story, { eager: true })
  tests: StoryTest[];

  @OneToMany(type => SprintStory, sprint => sprint.story)
  sprintStories: SprintStory[];

  @OneToMany(type => StoryNotification, notification => notification.story)
  notifications: StoryNotification[];

  @ManyToOne(type => Project, project => project.stories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(type => User, user => user.stories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: User;
  
  @OneToMany(type => PlanningPokerRound, round => round.story)
  planningPokerRounds: PlanningPokerRound[];
}
