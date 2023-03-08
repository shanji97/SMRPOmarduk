import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { ConfigSchema } from './config.schema';
import { DatabaseConfigService } from './database-config.service';
import { ServeStaticConfigService } from './serve-static-config.service';

@Global()
@Module({
  imports: [
    /**
     * @see https://docs.nestjs.com/techniques/configuration
     */
    ConfigModule.forRoot({
      cache: true,
      envFilePath: process.env.CONFIG, // Path to config file
      expandVariables: true,
      ignoreEnvFile: !process.env.CONFIG || process.env.CONFIG.trim().length === 0 || !!process.env.IGNORE_CONFIG,
      isGlobal: true,
      validationOptions: {
        allowUnknown: true, // Skip unknown env vars
        abortEarly: false, // Show all validation errors
      },
      validationSchema: ConfigSchema,
    }),
  ],
  providers: [
    DatabaseConfigService,
    ServeStaticConfigService,
  ],
  exports: [
    DatabaseConfigService,
    ServeStaticConfigService,
  ]
})
export class CustomConfigModule {}
