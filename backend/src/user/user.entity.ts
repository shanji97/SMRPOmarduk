import { Member } from 'src/member/member.entity';
import { Entity, Column, CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn, OneToMany } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn({ unsigned: true })
  id: number;

  @Column({ length: 128 })
  firstName: string;

  @Column({ length: 128 })
  lastName: string;

  @Column({ length: 128, unique: true })
  username: string;

  @Column({ length: 60, select: false })
  password: string;

  @Column({ nullable: true })
  email?: string | null;

  @Column({ type: 'bool', unsigned: true, default: false })
  isAdmin: boolean;

  @Column({ type: 'bool', unsigned: true, default: false })
  deleted: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @CreateDateColumn()
  dateCreated: string;

  @UpdateDateColumn()
  dateUpdated: string;

  // @OneToMany(type => Member, member => member.user)
  // members: Member[]
}
