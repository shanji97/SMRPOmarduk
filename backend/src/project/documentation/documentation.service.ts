import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as fs from 'fs';
import * as moment from 'moment';
import * as path from 'path';
import sanitize = require('sanitize-filename');

@Injectable()
export class DocumentationService {
  private readonly logger: Logger = new Logger(DocumentationService.name);

  private readonly rootDirectoryPath: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.rootDirectoryPath = path.join(this.configService.get<string>('DATA_DIR'), 'project');

    // Create directory if not exits
    try {
      if (!fs.existsSync(this.rootDirectoryPath))
        fs.mkdirSync(this.rootDirectoryPath);
    } catch (ex) {
      this.logger.warn(ex.message);
    } 
  }

  getProjectDirPath(projectId: number): string {
    const p = path.join(this.rootDirectoryPath, `p_${projectId}`);
    return p;
  }

  getFileInProjectDirPath(projectId: number, filename: string): string {
    return path.join(this.getProjectDirPath(projectId), filename);
  }

  async projectDirExists(projectId: number): Promise<boolean> {
    return await fs.promises.access(this.getProjectDirPath(projectId), fs.constants.F_OK).then(() => true).catch(() => false);
  }

  async fileInProjectDirExists(projectId: number, filename: string): Promise<boolean> {
    return await fs.promises.access(this.getFileInProjectDirPath(projectId, filename), fs.constants.F_OK).then(() => true).catch(() => false);
  }

  async listFilesInProjectDir(projectId: number): Promise<string[]> {
    return await fs.promises.readdir(this.getProjectDirPath(projectId));
  }

  async createProjectDir(projectId: number): Promise<void> {
    await fs.promises.mkdir(this.getProjectDirPath(projectId));
  }

  async moveFileToProjectDir(projectId: number, filePath: string, fileName: string) {
    fileName = sanitize(fileName);
    
    let newFilename: string, ext: string = '';

    // Handle extension
    if (fileName.lastIndexOf('.') > -1) {
      ext = fileName.substring(fileName.lastIndexOf('.'));
      fileName = fileName.substring(0, fileName.lastIndexOf('.'));
    }

    if (!this.configService.get<boolean>('UPLOAD_OVERWRITE')) {
      let count = 0;
      while ((!newFilename || await this.fileInProjectDirExists(projectId, newFilename)) && count < 1000) {
        if (!newFilename) {
          newFilename = fileName + ext;
        } else {
          newFilename = `${fileName}_${moment().format('hhmmss_DDMMYYYY')}_${Math.floor(Math.random() * 1000)}${ext}`;
        }
        count++;
        if (count > 500)
          throw new Error("Duplicate filename");
      }
    } else {
      newFilename = fileName + ext;
    }
    
    // Remove existing file
    if (await this.fileInProjectDirExists(projectId, newFilename))
      await fs.promises.rm(this.getFileInProjectDirPath(projectId, newFilename));

    await fs.promises.rename(filePath, this.getFileInProjectDirPath(projectId, newFilename));
  }
}
