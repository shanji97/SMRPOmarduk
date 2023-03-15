import { Entity, Column,PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import {Test} from '../test/test.entity';

@Entity()
export class Story {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column("varchar", { length: 200 })
  title: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "tinyint" })
  priority: number

  @Column({ type: "tinyint" })
  businessValues: number

  @OneToMany(type => Test, test => test.story)
  testi: Test
}
