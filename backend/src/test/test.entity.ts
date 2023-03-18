import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Story } from '../story/story.entity';

@Entity()
export class Test {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ type: "text" })
  name: string;

  @Column({ unsigned: true, nullable: true })
  storyId: number;

  @ManyToOne(type => Story, story => story.testi, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  story: Story;
}