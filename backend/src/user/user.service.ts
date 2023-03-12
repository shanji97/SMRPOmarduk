import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { Repository, QueryFailedError } from 'typeorm';

import { User } from './user.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class UserService {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }

  async hashPassword(password: string): Promise<string> {
    return await hash(password, this.configService.get<number>('BCRYPT_SALT_ROUNDS')); 
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find({ order: { lastName: 'ASC', firstName: 'ASC' }});
  }

  async getUserById(userId: number): Promise<User> {
    return await this.userRepository.findOneBy({ id: userId });
  }

  async getUserByUsernameForLogin(username: string): Promise<User> {
    return await this.userRepository.createQueryBuilder('user').addSelect('user.password').where('user.username = :username', { username: username }).getOne();
  }

  async createUser(user) {
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

  async updateUserById(userId, user) {
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
    await this.userRepository.delete({ id: userId });
  }
}
