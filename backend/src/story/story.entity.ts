import { title } from 'process';
import { text } from 'stream/consumers';
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

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


}
