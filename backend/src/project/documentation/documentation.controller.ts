import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, InternalServerErrorException, HttpCode, HttpException, UseInterceptors, UploadedFile, StreamableFile } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import sanitize = require('sanitize-filename');

import { DocumentationService } from './documentation.service';
import { ProjectService } from '../project.service';
import { Token } from '../../auth/decorator/token.decorator';
import { TokenDto } from '../../auth/dto/token.dto';
import { ValidationException } from '../../common/exception/validation.exception';


@ApiTags('documentation')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('project/:projectId/documentation')
export class DocumentationController {
  constructor(
    private readonly documentationService: DocumentationService,
    private readonly projectService: ProjectService,
  ) {}

  @ApiOperation({ summary: 'List project documentation files' })
  @ApiOkResponse()
  @Get()
  async listFiles(
    @Token() token: TokenDto,
    @Param('projectId') projectId: number,
  ): Promise<{ files: string[] }> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, null))
      throw new ForbiddenException('Unsufficient permissions');

    return {
      files: await this.documentationService.listFilesInProjectDir(projectId), 
    };
  }

  @ApiOperation({ summary: 'Upload project documentation file' })
  @ApiCreatedResponse()
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @UploadedFile() file,
  ) {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, null))
      throw new ForbiddenException('Unsufficient permissions');

    // Project directory
    if (!await this.documentationService.projectDirExists(projectId))
      await this.documentationService.createProjectDir(projectId);

    /*
      File properties:
      - fieldname: property name, where fili is specified
      - originalname
      - encoding
      - mimetype
      - destination (tmp upload directory)
      - filename (temporary filename)
      - path (full relative path to temporary file)
      - file size
    */
    try {
      await this.documentationService.moveFileToProjectDir(projectId, file.path, file.originalname);
    } catch (ex) {
      await fs.promises.rm(file.path); // Remove file so it doesn't stay in temp directory
      throw new InternalServerErrorException(ex.message);
    }
  }

  @ApiOperation({ summary: 'Download project documentation file' })
  @ApiOkResponse()
  @Get('file/:filename')
  async downloadFile(
    @Token() token: TokenDto,
    @Param('projectId', ParseIntPipe) projectId: number,
    @Param('filename') filename: string,
  ): Promise<StreamableFile> {
    // Check permissions
    if (!token.isAdmin && !await this.projectService.hasUserRoleOnProject(projectId, token.sid, null))
      throw new ForbiddenException('Unsufficient permissions');

    filename = sanitize(filename);

    if (!await this.documentationService.fileInProjectDirExists(projectId, filename))
      throw new NotFoundException();

    const file = fs.createReadStream(this.documentationService.getFileInProjectDirPath(projectId, filename));
    return new StreamableFile(file);
  }

  // TODO: Generate custom reports
}
