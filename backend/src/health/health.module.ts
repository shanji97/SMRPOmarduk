import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { CustomConfigModule } from '../custom-config/custom-config.module';
import { HealthController } from './health.controller';
import { HttpConfigService } from '../custom-config/http-config.service';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [CustomConfigModule],
      useExisting: HttpConfigService,
    }),
    TerminusModule,
  ],
  exports: [
    TerminusModule,
  ],
  controllers: [
    HealthController,
  ],
})
export class HealthModule {}
