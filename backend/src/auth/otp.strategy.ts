import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';

import { AuthService } from './auth.service';
import { User } from '../user/user.entity';

@Injectable()
export class OtpStrategy extends PassportStrategy(Strategy, 'otp') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(req) {
    const user: User = req.user;
    const twoFa: string | undefined = req.body.twoFa;

    if (!user.twoFa || !user.twoFaConfirmed) // If 2FA not enabled or not confirmed
      return user;
    if (!twoFa)
    throw new UnauthorizedException('2FA required');
    if (!this.authService.validate2FA(req.body.twoFa , user.twoFa))
      throw new UnauthorizedException('Invalid 2FA');
    
    delete user.twoFa;
    delete user.twoFaConfirmed;
    return user;
  }
}
