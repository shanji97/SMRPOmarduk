import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';

import { Project } from './project.entity';
import { User } from '../user/user.entity';

export enum UserRole {
  Developer = 0,
  ScrumMaster = 1,
  ProjectOwner = 2,
}

@Entity()
export class ProjectUserRole {
  @PrimaryColumn({ unsigned: true })
  projectId: number;

  @PrimaryColumn({ unsigned: true })
  userId: number;

  @PrimaryColumn({ unsigned: true })
  role: number;

  @ManyToOne(type => Project, project => project.userRoles, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

  @ManyToOne(type => User, user => user.userRoles, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: User;
}
