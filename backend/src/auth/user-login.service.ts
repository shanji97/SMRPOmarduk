import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UserLogin } from './user-login.entity';

@Injectable()
export class UserLoginService {
  private readonly logger: Logger = new Logger(UserLoginService.name);

  constructor(
    @InjectRepository(UserLogin)
    private readonly userLoginRepository: Repository<UserLogin>,
  ) {}

  async getLoginsForUser(userId: number): Promise<UserLogin[]> {
    return await this.userLoginRepository.find({ where: { userId: userId }, order: { date: 'DESC' }});
  }

  async getLastLoginForUser(userId: number): Promise<UserLogin | null> {
    const result = await this.userLoginRepository.find({ where: { userId: userId }, order: { date: 'DESC' }, skip: 1, take: 1 });
    return (result.length > 0) ? result[0] : null;
  }

  async logLoginForUser(userId: number): Promise<void> {
    await this.userLoginRepository.insert({ userId: userId });
  }
}
