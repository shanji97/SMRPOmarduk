import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';

import { Task } from './task.entity';
import { User } from '../user/user.entity';

@Entity()
export class TaskUserTime {
  @PrimaryColumn({ type: 'date', default: () => 'NOW()' })
  date: string;

  @PrimaryColumn({ unsigned: true })
  taskId: number;

  @ManyToOne(type => Task, task => task.userTime, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  task: Task;

  @PrimaryColumn({ unsigned: true })
  userId: number;

  @ManyToOne(type => User, user => user.taskTime, { onUpdate: 'CASCADE', onDelete: 'RESTRICT' })
  user: User;

  @Column({ type: 'float'})
  spent: number; // Spent time in hours

  @Column({ type: 'float' })
  remaining; // Remaining time in hours

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @CreateDateColumn()
  dateCreated: string;

  @UpdateDateColumn()
  dateUpdated: string;
}
