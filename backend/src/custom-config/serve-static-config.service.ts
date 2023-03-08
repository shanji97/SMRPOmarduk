import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServeStaticModuleOptionsFactory, ServeStaticModuleOptions } from '@nestjs/serve-static';
import { join } from 'path';

@Injectable()
export class ServeStaticConfigService implements ServeStaticModuleOptionsFactory{

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
      path = join(__dirname, path);
    return [
      {
        rootPath: path,
      },
    ];
  }
}
