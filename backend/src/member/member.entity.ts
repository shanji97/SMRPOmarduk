import { Project } from 'src/project/project.entity';
import { User } from 'src/user/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Member {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({unsigned:true, type: "int" })
    projectId: number;

    @Column({unsigned:true, type: "int" })
    userId: number;

    @Column({unsigned:true, type: "int" })
    role: number;

    @ManyToOne(type => Project, project => project.members, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    project: Project;

    @ManyToOne(type => User, user => user.members, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    user: User;
}
