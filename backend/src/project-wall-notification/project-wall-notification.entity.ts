import { Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { NotificationComment } from '../notification-comments/wallNotification.entity';
import { Project } from '../project/project.entity';
import { User } from 'src/user/user.entity';

@Entity()
export class ProjectWallNotification {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 128, unique: true })
  author: string;

  @Column({ unsigned: true, type: 'int' })
  projectId: number;

  @Column({ unsigned: true, type: 'int' })
  userId: number;

  @ManyToOne(type => Project, project => project.wallNotifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  project: Project;

  @Column({ type: 'text', nullable: true })
  postContent?: string | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: string;

  @OneToMany(type => NotificationComment, comment => comment.notifications)
  comments: NotificationComment[];

  @ManyToOne(type => User, user => user.projectWallNotifications)
  user: User;
}
