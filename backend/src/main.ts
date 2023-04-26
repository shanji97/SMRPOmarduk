import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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
  const docPath = configService.get<string>('DOC_PATH');
  const enableDocs = configService.get<boolean>('DOCS');
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

  // API documentation
  if (enableDocs) {
    const docConfig = new DocumentBuilder()
      .setTitle('SMRPO')
      .setDescription('SMRPO application')
      .setVersion(getAppVersion())
      .addBearerAuth({
        type: 'apiKey',
        in: 'header',
        name: 'Authorization',
      })
      .addTag('auth', 'Authentication')
      .addTag('common-password', 'Common password')
      .addTag('documentation', 'Documentation')
      .addTag('health', 'Healthcheck')
      .addTag('user', 'User')
      .addTag('planning-pocker', 'Story planning pocker')
      .addTag('project', 'Project')
      .addTag('sprint', 'Sprint')
      .addTag('story', 'Story')
      .addTag('task', 'Task')
      .addTag('user-login', 'User logins')
      .build();
    const document = SwaggerModule.createDocument(app, docConfig);
    SwaggerModule.setup((globalPrefix) ? `${globalPrefix}/${docPath}` : docPath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      }
    });
  }

  await app.listen(port);
}
bootstrap();
