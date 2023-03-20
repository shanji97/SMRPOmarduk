import { Project } from 'src/project/project.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class Member {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Column({ type: "bigint" })
    projectId: number;

    @Column({ type: "bigint" })
    userId: number;

    @Column({ type: "tinyint" })
    role: number;

    @ManyToOne(type => Project, project => project.members, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    project: Project;

    // @ManyToOne(type => User, user => user.members, { onUpdate: 'CASCADE', onDelete: 'CASCADE' })
    // user: User;
}
