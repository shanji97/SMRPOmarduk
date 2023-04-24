import { Entity, Column, CreateDateColumn, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ProjectUserRole } from '../project/project-user-role.entity';
import { Task } from '../task/task.entity';
import { UserLogin } from '../auth/user-login.entity';
import { StoryNotification } from '../story-notification/story-notification.entity';
import { ProjectWallNotification } from '../project-wall-notification/project-wall-notification.entity';
import { ProjectWallNotificationComment } from '../project-wall-notification-comment/comment.entity';

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

  @Column({ unique: true })
  email: string;

  @Column({ type: 'char', length: 16, nullable: true, default: null, select: false })
  twoFa: string | null;

  @Column({ type: 'bool', default: false, select: false })
  twoFaConfirmed: boolean;

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

  @OneToMany(type => UserLogin, login => login.user)
  logins: UserLogin[];

  @OneToMany(type => ProjectUserRole, userRole => userRole.user)
  userRoles: ProjectUserRole[]

  @OneToMany(type => Task, task => task.assignedUser)
  tasks: Task[];

  @OneToMany(type => StoryNotification, storyNotification => storyNotification.author)
  storyNotifications: StoryNotification[];

  @OneToMany(type => ProjectWallNotification, projectWallNotification => projectWallNotification.user)
  projectWallNotifications: ProjectWallNotification[];

  @OneToMany(type => ProjectWallNotificationComment, projectWallNotificationComment => projectWallNotificationComment.user)
  projectWallNotificationComments: ProjectWallNotificationComment[];
}
