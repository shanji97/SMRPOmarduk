import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../user/user.entity';
import { ProjectWallNotification } from '../project-wall-notification/project-wall-notification.entity';

@Entity()
export class ProjectWallNotificationComment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 200 })
  author: string;

  @Column({ unsigned: true, type: 'int' })
  projectWallNotificationId: number;

  @Column({ unsigned: true, type: 'int' })
  userId: number;

  @ManyToOne(type => ProjectWallNotification, project => project.comments, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  projectWallNotification: ProjectWallNotification;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: string;

  @ManyToOne(type => User, user => user.projectWallNotificationComments)
  user: User;
}
