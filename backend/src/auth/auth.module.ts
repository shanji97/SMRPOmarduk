import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CustomConfigModule } from '../custom-config/custom-config.module';
import { JwtConfigService } from '../custom-config/jwt-config.service';
import { JwtStrategy } from './jwt.strategy';
import { LocalStrategy } from './local.strategy';
import { OtpStrategy } from './otp.strategy';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [CustomConfigModule],
      useExisting: JwtConfigService,
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),
    UserModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    OtpStrategy,
  ],
  controllers: [
    AuthController,
  ],
  exports: [
    AuthService,
    JwtModule,
    PassportModule,
  ],
})
export class AuthModule {}
