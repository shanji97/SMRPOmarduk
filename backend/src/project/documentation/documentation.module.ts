import { forwardRef, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { CustomConfigModule } from '../../custom-config/custom-config.module';
import { DocumentationService } from './documentation.service';
import { DocumentationController } from './documentation.controller';
import { MulterConfigService } from '../../custom-config/multer-config.service';
import { ProjectModule } from '../project.module';

@Module({
  imports: [
    forwardRef(() => ProjectModule),
    MulterModule.registerAsync({
      imports: [CustomConfigModule],
      useExisting: MulterConfigService,
    })
  ],
  providers: [DocumentationService],
  controllers: [DocumentationController]
})
export class DocumentationModule {}
