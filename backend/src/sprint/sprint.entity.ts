import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Project } from '../project/project.entity';

@Entity()
export class Sprint {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column()
  name: string;

  @Column({ unsigned: true })
  velocity: number;

  @Column({ type: 'date' })
  startDate: string;

  @Column({ type: 'date' })
  endDate: string;
  
  @Column({ unsigned: true })
  projectId: number;

  @ManyToOne(type => Project, project => project.sprints, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;
}
