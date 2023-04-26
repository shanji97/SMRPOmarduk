import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MulterOptionsFactory } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory, OnModuleInit {

  constructor(
    private readonly configService: ConfigService,
  ) {}

  onModuleInit() {
    const p = path.join(this.configService.get<string>('DATA_DIR'), 'tmpupload');
    if (!fs.existsSync(p))
      fs.mkdirSync(p);
  }

  createMulterOptions(): MulterOptions | Promise<MulterOptions> {
    return {
      dest: path.join(this.configService.get<string>('DATA_DIR'), 'tmpupload'),
    };
  }
}
