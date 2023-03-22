import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from './custom-config/custom-config.module';
import { DatabaseConfigService } from './custom-config/database-config.service';
import { HealthModule } from './health/health.module';
import { HealthController } from './health/health.controller';
import { HttpConfigService } from './custom-config/http-config.service';
import { HttpLoggingInterceptor } from './interceptor/http-logging/http-logging.interceptor';
import { ServeStaticConfigService } from './custom-config/serve-static-config.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    CustomConfigModule,
    ServeStaticModule.forRootAsync({
      imports: [CustomConfigModule],
      useExisting: ServeStaticConfigService,
    }),
    TypeOrmModule.forRootAsync({
      imports: [CustomConfigModule],
      useExisting: DatabaseConfigService,
    }),
    HttpModule.registerAsync({
      imports: [CustomConfigModule],
      useExisting: HttpConfigService,
    }),
    HealthModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpLoggingInterceptor,
    },
    AppService,
  ],
})
export class AppModule {}
