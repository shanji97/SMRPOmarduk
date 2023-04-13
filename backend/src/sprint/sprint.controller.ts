import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateSprintDto, CreateSprintSchema } from './dto/create-sprint.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { ProjectService } from '../project/project.service';
import { SprintService } from './sprint.service';
import { Token } from '../auth/decorator/token.decorator';
import { TokenDto } from '../auth/dto/token.dto';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';

@ApiTags('sprint')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('sprint')
export class SprintController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly sprintService: SprintService,
  ) {}
  
  @ApiOperation({ summary: 'Create new sprint' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':projectId')
  async createSprint(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body(new JoiValidationPipe(CreateSprintSchema)) sprint: CreateSprintDto,
  ): Promise<void> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, UserRole.ScrumMaster))
      throw new ForbiddenException();
    try {
      await this.sprintService.createSprint(projectId, sprint);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }
}
