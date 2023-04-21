import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, Unique } from 'typeorm';
import { Story } from '../story/story.entity';
import { User } from '../user/user.entity';

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

    @Column({ type: 'boolean', default: false })
    approved: boolean;

    // @ManyToOne(type => Story, story => story.notifications, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    // story: Story;
}
