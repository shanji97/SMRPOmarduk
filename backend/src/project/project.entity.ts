import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { ProjectUserRole } from './project-user-role.entity';
import { Sprint } from '../sprint/sprint.entity';
import { Story } from '../story/story.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 128, unique: true })
  projectName: string;

  @Column({ type: 'text', nullable: true })
  projectDescription?: string | null;
  
  @OneToMany(type => ProjectUserRole, userRole => userRole.project)
  userRoles: ProjectUserRole[];

  @OneToMany(type => Sprint, sprint => sprint.project)
  sprints: Sprint[];

  @OneToMany(type => Story, story => story.project)
  stories: Story[];
}


