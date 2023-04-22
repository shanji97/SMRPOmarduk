import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';
import { Story } from '../story/story.entity';
import { User } from '../user/user.entity';

export enum NotificationStatus {
   Rejected = 0,
   Accepted = 1
  }
  
@Entity()
export class StoryNotification {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ unsigned: true, type: 'int' })
    stroyId: number;

    @Column({ unsigned: true, type: 'int' })
    userId: number;

    @Column({ type: 'text' })
    notificationText: string;

    @Column({ type: 'int', default: NotificationStatus.Rejected })
    notificationStatus: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    created: string;

    @ManyToOne(type => Story, story => story.notifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    story: Story;

    @ManyToOne(type => User, user => user.storyNotifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    author: User;
}
