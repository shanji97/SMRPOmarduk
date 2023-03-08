import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomConfigModule } from './custom-config/custom-config.module';
import { DatabaseConfigService } from './custom-config/database-config.service';
import { ServeStaticConfigService } from './custom-config/serve-static-config.service';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
