import { Entity, Column, CreateDateColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../user/user.entity';

@Entity()
export class UserLogin {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @CreateDateColumn()
  date: string;

  @Column({ unsigned: true })
  userId: number;

  @ManyToOne(type => User, user => user.logins, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
  user: User;
}
