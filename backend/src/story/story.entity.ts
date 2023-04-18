import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';

import { Project } from '../project/project.entity';
import { Task } from '../task/task.entity';
import { Test } from '../test/test.entity';
import { SprintStory } from '../sprint/sprint-story.entity';

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

  @Column({ type: 'integer', default: 1 })
  timeComplexity: number

  @Column({ type: 'boolean', default: false })
  isRealized: boolean;

  @OneToMany(type => Task, task => task.story)
  tasks: Task[];

  @OneToMany(type => Test, test => test.story)
  tests: Test[];

  @OneToMany(type => SprintStory, sprint => sprint.story)
  sprintStories: SprintStory[];

  @ManyToOne(type => Project, project => project.stories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

}
