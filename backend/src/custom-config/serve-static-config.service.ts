import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModuleOptionsFactory, ServeStaticModuleOptions } from '@nestjs/serve-static';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class ServeStaticConfigService implements ServeStaticModuleOptionsFactory{
  private readonly logger: Logger = new Logger(ServeStaticConfigService.name);

  constructor(
    private readonly configService: ConfigService,
  ) {}
  
  /**
   * @see https://docs.nestjs.com/recipes/serve-static
   * @see https://github.com/nestjs/serve-static/blob/master/lib/interfaces/serve-static-options.interface.ts
   */
  createLoggerOptions(): ServeStaticModuleOptions[] | Promise<ServeStaticModuleOptions[]> {
    let path = this.configService.get<string>('STATIC_DIR');
    if (!path.startsWith('/'))
      path = join(__dirname, '..', path);

    // Check if directory for static content exists else try to create it
    try {
      this.logger.log('Checking if directory for static exists');
      if (!fs.existsSync(path)) { // Check if directory doesn't exists
        this.logger.log('Creating directory for static content');
        fs.mkdirSync(path, { recursive: true });
      }
    } catch (e) {
      this.logger.warn(e);
    }
    
    return [
      {
        rootPath: path,
      },
    ];
  }
}
