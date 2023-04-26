import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from '../project/project.entity';
import { SprintStory } from './sprint-story.entity';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ type: 'float', unsigned: true })
  velocity: number; // in points

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;

  @Column({ unsigned: true })
  projectId: number;

  @ManyToOne(type => Project, project => project.sprints, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

  @OneToMany(type => SprintStory, sprint => sprint.sprint)
  sprintStories: SprintStory[]

}
