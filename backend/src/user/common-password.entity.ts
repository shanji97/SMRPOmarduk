import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CommonPassword {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column()
  password: string;
}
