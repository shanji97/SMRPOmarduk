import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';
import { Story } from '../story/story.entity';
import { User } from '../user/user.entity';

export enum NotificationStatus {
  Rejected = 0, //26 kartica
  Info = 1, //10 kartica
}

@Entity()
export class StoryNotification {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ unsigned: true, type: 'int' })
  storyId: number;

  @Column({ unsigned: true, type: 'int' })
  userId: number;

  @Column({ length: 200 })
  authorName: string;

  @Column({ type: 'text' })
  notificationText: string;

  @Column({ type: 'int', default: NotificationStatus.Rejected })
  notificationType: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created: string;

  @Column({ type: 'boolean', default: true })
  approved: boolean;

  @ManyToOne(type => Story, story => story.notifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  story: Story;

  @ManyToOne(type => User, user => user.storyNotifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  author: User;
}
