import { Story } from '../story/story.entity';
import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Sprint } from './sprint.entity';

@Entity()
export class SprintStory {
    @PrimaryColumn({ unsigned: true })
    storyId: number;

    @PrimaryColumn({ unsigned: true })
    sprintId: number;

    @ManyToOne(type => Story, story => story.sprintStories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    story: Story;

    @ManyToOne(type => Sprint, user => user.sprintStories, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    sprint: Sprint;
}
