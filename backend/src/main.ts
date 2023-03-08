import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as fs from 'fs';
import helmet from 'helmet';

import { AppModule } from './app.module';

function getAppVersion(): string {
  if (fs.existsSync('package.json')) {
    try {
      const pkg = JSON.parse(fs.readFileSync('package.json').toLocaleString());
      return pkg.version || 'unknown';
    } catch {
      return 'unknown';
    }
  }
  return 'unknown';
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Get configuration
  const globalPrefix = configService.get<string>('GLOBAL_PREFIX');
  const port = configService.get<number>('PORT');
  
  // REST global prefix
  if (globalPrefix)
    app.setGlobalPrefix(globalPrefix);
  
  // Middlewares
  app.use(compression());
  app.use(helmet({
    contentSecurityPolicy: false,
  }));
  app.enableCors();
  app.enableShutdownHooks();

  await app.listen(port);
}
bootstrap();
