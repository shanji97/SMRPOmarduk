import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProjectModule } from '../project/project.module';
import { Sprint } from './sprint.entity';
import { SprintController } from './sprint.controller';
import { SprintService } from './sprint.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sprint,
    ]),
    ProjectModule,
  ],
  providers: [
    SprintService,
  ],
  controllers: [
    SprintController,
  ],
})
export class SprintModule {}
