import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtOptionsFactory } from '@nestjs/jwt';

import * as fs from 'fs';

@Injectable()
export class JwtConfigService implements JwtOptionsFactory {
  constructor(
    private readonly configService: ConfigService,
  ) {}

  createJwtOptions(): JwtModuleOptions | Promise<JwtModuleOptions> {
    const secret = this.configService.get<string>('JWT_SECRET');
    const publicKeyPath = this.configService.get<string>('JWT_PUBLIC_KEY_PATH');
    const privateKeyPath = this.configService.get<string>('JWT_PRIVATE_KEY_PATH');

    if (publicKeyPath && privateKeyPath && fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
      return {
        publicKey: fs.readFileSync(publicKeyPath),
        privateKey: fs.readFileSync(privateKeyPath),
      };
    }

    return {
      secret: secret,
    };
  }

  getKeyOrSecret(): string | Buffer {
    const secret = this.configService.get<string>('JWT_SECRET');
    const publicKeyPath = this.configService.get<string>('JWT_PUBLIC_KEY_PATH');
    const privateKeyPath = this.configService.get<string>('JWT_PRIVATE_KEY_PATH');

    if (publicKeyPath && privateKeyPath && fs.existsSync(publicKeyPath) && fs.existsSync(privateKeyPath)) {
      return fs.readFileSync(privateKeyPath);
    }

    return secret;
  }
}
