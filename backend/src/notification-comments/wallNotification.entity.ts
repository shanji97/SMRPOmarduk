import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ProjectWallNotification } from '../project-wall-notification/project-wall-notification.entity';

@Entity()
export class NotificationComment {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: 'text' })
  comment: string;

  @Column({ unsigned: true, nullable: true })
  projectWallNotificationId: number;

  @ManyToOne(type => ProjectWallNotification, notification => notification.comments, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  notifications: ProjectWallNotification;
}