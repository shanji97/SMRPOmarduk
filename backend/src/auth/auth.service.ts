import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

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
      return user; // Return info about user
    }
    return null; // Not valid credentials
  }

  async createTokenForUser(user) {
    const payload = {
      sid: user.id,
      sub: user.username,
    };
    return {
      token: await this.jwtService.signAsync(payload, {
        expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRE'),
      }),
    };
  }
}
