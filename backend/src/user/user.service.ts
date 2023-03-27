import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { compare, hash } from 'bcrypt';
import { authenticator } from 'otplib';
import { DeepPartial, Repository, QueryFailedError } from 'typeorm';

import { CommonPasswordService } from './common-password.service';
import { User } from './user.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly logger: Logger = new Logger(UserService.name);

  constructor(
    private readonly commonPasswordService: CommonPasswordService,
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
    const defaultUserEmail: string | null = this.configService.get<string | null>('DEFAULT_USER_PASSWORD');

    const count = await this.getUserCount();
    if (count > 0 || !defaultUserUsername || !defaultUserPassword || !defaultUserEmail)
      return;
    
    // Create default user
    await this.createUser({
      firstName: 'Default',
      lastName: 'User',
      username: defaultUserUsername,
      password: defaultUserPassword,
      email: defaultUserEmail,
      isAdmin: true,
    });
    this.logger.log(`Default user ${defaultUserUsername} created.`); 
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
    return await this.userRepository.createQueryBuilder('user').addSelect(['user.password', 'user.twoFa', 'user.twoFaConfirmed']).where('user.username = :username', { username: username }).getOne();
  }

  async getUserPassword(userId: number): Promise<string | null> {
    return (await this.userRepository.createQueryBuilder('user').select('user.password').where('user.id = :id', { id: userId }).getOne())?.password || null;
  }

  async createUser(user: DeepPartial<User>) {
    // Hash password
    if (user.password) {
      if (await this.commonPasswordService.checkIfPasswordIsCommon(user.password))
        throw new ValidationException('Password is among common passwords');
      user.password = await this.hashPassword(user.password);
    }

    try {
      await this.userRepository.insert(user);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Username or email already exists');
        }
      }
    }
  }

  async updateUserById(userId: number, user: DeepPartial<User>) {
    // Hash passwords
    if (user.password) {
      if (await this.commonPasswordService.checkIfPasswordIsCommon(user.password))
        throw new ValidationException('Password is among common passwords');
      user.password = await this.hashPassword(user.password);
    }
    
    try {
      await this.userRepository.update({ id: userId }, user);
    } catch (ex) {
      if (ex instanceof QueryFailedError) {
        switch(ex.driverError.errno) {
          case 1062: // Duplicate entry
            throw new ValidationException('Username or email already exists');
        }
      }
    }
  }

  async deleteUserById(userId: number) {
    await this.userRepository.update({ id: userId }, { deleted: true });
  }

  create2FASecret(): string {
    return authenticator.generateSecret();
  }

  create2FAURL(user: string, service: string, secret: string): string {
    return authenticator.keyuri(user, service, secret);
  }

  validate2Fa(code: string, secret: string) {
    return authenticator.check(code, secret);
  }

  async hasUser2FA(userId: number, unconfirmed: boolean = false): Promise<boolean> {
    const result = await this.userRepository.createQueryBuilder('user').select(['user.twoFa', 'user.twoFaConfirmed']).where('user.id = :id', { id: userId }).getOne();
    return !(!result || !result.twoFa || result.twoFa.length < 1 || ((unconfirmed) ? false : !result.twoFaConfirmed));
  }

  async set2FASecretForUser(userId: number, secret: string) {
    await this.userRepository.update({ id: userId }, { twoFa: secret });
  }

  async confirm2FAForUser(userId: number, code: number): Promise<boolean> {
    const result = await this.userRepository.createQueryBuilder('user').select('user.twoFa').getOne();
    if (!result.twoFa)
      return false;
    if (this.validate2Fa(`${code}`, result.twoFa)) {
      await this.userRepository.update({ id: userId }, { twoFaConfirmed: true });
      return true;
    }
    return false;
  }

  async remove2FAForUser(userId: number) {
    await this.userRepository.update({ id: userId }, { twoFa: null, twoFaConfirmed: false });
  }
}
