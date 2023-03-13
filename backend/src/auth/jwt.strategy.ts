import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Strategy } from 'passport-custom';
import { ExtractJwt } from 'passport-jwt';

import { tokenSchema, TokenDto } from './dto/token.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtService: JwtService,
  ) {
    super();
  }

  async validate(req) {
    const token = ExtractJwt.fromAuthHeaderWithScheme('JWT')(req);
    if (!token)
      return null;
    try {
      const decodedToken = await this.jwtService.verifyAsync(token);
      const value: TokenDto = await tokenSchema.validateAsync(decodedToken);

      return value;
    } catch (ex) {
      throw new UnauthorizedException(ex);
    }
  }
}
