import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';
import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { StoryTest } from '../test/test.entity';
import { SprintStory } from '../sprint/sprint-story.entity';
import { StoryNotification } from '../story-notification/story-notification.entity';

export enum Category {
  Unassigned = 0,
  Assigned = 1,
  Finished = 2,
}

@Entity()
@Unique(['title', 'projectId'])
@Unique(['sequenceNumber', 'projectId'])
export class Story {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, type: 'int' })
  projectId: number;

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

  @Column({ type: 'integer', default: 0 })
  timeComplexity: number

  @Column({ type: 'boolean', default: false })
  isRealized: boolean;

  @Column({ type: 'boolean', default: false })
  rejected: boolean;

  @OneToMany(type => Task, task => task.story)
  tasks: Task[];

  @OneToMany(type => StoryTest, test => test.story, { eager: true })
  tests: StoryTest[];

  @OneToMany(type => SprintStory, sprint => sprint.story)
  sprintStories: SprintStory[];

  // @OneToMany(type => StoryNotification, notification => notification.story)
  // notifications: StoryNotification[];

  @ManyToOne(type => Project, project => project.stories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

}
