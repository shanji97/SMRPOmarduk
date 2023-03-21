import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.getUserByUsernameForLogin(username);
    if (user && await this.userService.comparePassword(password, user.password)) {
      delete user.password;
      return user; // Return info about user
    }
    return null; // Not valid credentials
  }

  async createTokenForUser(user: User) {
    const payload = {
      sid: user.id,
      sub: user.username,
      sname: `${user.firstName} ${user.lastName}`,
      isAdmin: user.isAdmin,
    };
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
