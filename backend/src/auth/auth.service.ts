import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/user.entity';
import { UserLoginService } from './user-login.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userLoginService: UserLoginService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getUserByUsernameForLogin(username);
    if (!user || !await this.userService.comparePassword(password, user.password) || user.deleted)
      return null; // Not valid credentials
    
    delete user.password;
    return user; // Return info about user
  }

  async createTokenForUser(user: User) {
    const payload = {
      sid: user.id,
      sub: user.username,
      sname: `${user.firstName} ${user.lastName}`,
      isAdmin: user.isAdmin,
    };

    // Log user login
    await this.userLoginService.logLoginForUser(user.id);

    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE'),
      }),
    };
  }

  validate2FA(code: string, secret: string): boolean {
    return this.userService.validate2Fa(code, secret);
  }
}
