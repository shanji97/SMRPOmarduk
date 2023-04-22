import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ProjectUserRole } from './project-user-role.entity';
import { Sprint } from '../sprint/sprint.entity';
import { Story } from '../story/story.entity';
import { ProjectWallNotification } from '../project-wall-notification/project-wall-notification.entity';

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

  @Column({ type: 'boolean', default: false })
  isActive: boolean;

  @OneToMany(type => Story, story => story.project)
  stories: Story[];

  @OneToMany(type => ProjectWallNotification, projectWallNotifications => projectWallNotifications.project)
  wallNotifications: ProjectWallNotification[];
}