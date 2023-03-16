import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { User } from './user.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    this.initDefaultUser().then(() => {}).catch(e => this.logger.error(e));
  }

  async initDefaultUser() {
    const defaultUserUsername: string | null = this.configService.get<string | null>('DEFAULT_USER_USERNAME');
    const defaultUserPassword: string | null = this.configService.get<string | null>('DEFAULT_USER_PASSWORD');

    const count = await this.getUserCount();
    if (count === 0 && defaultUserPassword !== null && defaultUserUsername !== null) {
      await this.createUser({
        firstName: 'Default',
        lastName: 'User',
        username: defaultUserUsername,
        password: defaultUserPassword,
        isAdmin: true,
      });
      this.logger.log(`Default user ${defaultUserUsername} created.`);
    }
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.configService.get<number>('BCRYPT_SALT_ROUNDS')); 
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({ where: { deleted: false }, order: { lastName: 'ASC', firstName: 'ASC' }});
  }

  async getUserCount(): Promise<number> {
    return await this.userRepository.count();
  }

  async getUserById(userId: number): Promise<User> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  async getUserByUsernameForLogin(username: string): Promise<User> {
    return await this.userRepository.createQueryBuilder('user').addSelect('user.password').where('user.username = :username', { username: username }).getOne();
  }

  async createUser(user: DeepPartial<User>) {
    // Hash password
    if (user.password)
      user.password = await this.hashPassword(user.password);
    
    try {
      await this.userRepository.insert(user);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Username already exists');
        }
      }
    }
  }

  async updateUserById(userId: number, user: DeepPartial<User>) {
    // Hash passwords
    if (user.password)
      user.password = await this.hashPassword(user.password);
    
    try {
      await this.userRepository.update({ id: userId }, user);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Username already exists');
        }
      }
    }
  }

  async deleteUserById(userId: number) {
    await this.userRepository.update({ id: userId }, { deleted: true });
  }
}
