import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { access, readdir } from 'fs/promises';
import { constants, createReadStream } from 'fs';
import { join } from 'path';
import { createInterface } from 'readline';
import { Repository } from 'typeorm';

import { CommonPassword } from './common-password.entity';

@Injectable()
export class CommonPasswordService implements OnModuleInit {
  private readonly logger: Logger = new Logger(CommonPasswordService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(CommonPassword)
    private readonly commonPasswordRepository: Repository<CommonPassword>,
  ) {}

  onModuleInit() {
    this.initData().then(() => {}).catch(e => this.logger.error(e));
  }

  async initData() {
    if (await this.dataAvailable()) // Don't load data again if already available
      return;

    let path = this.configService.get<string>('DATA_DIR');
    if (!path.startsWith('/'))
      path = join(__dirname, '..', path);
    path = join(path, 'common-password');
    
    try {
      await access(path, constants.F_OK);
      this.logger.log(`Loading common passwords into database`);

      const files = await readdir(path); // Read files to load
      for (const file of files) { // Load data from each file
        const rl = createInterface({
          input: createReadStream(join(path, file)),
          crlfDelay: Infinity,
        });
        
        for await (const line of rl) {
          if (!line)
            continue;
          let password = line.trim();
          password = password.substring(0, Math.min(password.length, 255));
          try {
            await this.insertCommonPassword(password);
          } catch {
            this.logger.warn(`Failed to import password ${password} into database`);
          }
        }
      }
      this.logger.log(`Common passwords imported`);
    } catch {
      this.logger.warn(`Could not load common passwords into database, because init data does not exist`);
    }
  }

  async dataAvailable(): Promise<boolean> {
    return await this.commonPasswordRepository.exist()
  }

  async checkIfPasswordIsCommon(password: string): Promise<boolean> {
    return await this.commonPasswordRepository.exist({ where: { password: password }});
  }

  async insertCommonPassword(password: string) {
    if (await this.checkIfPasswordIsCommon(password)) // Don't add existing passwords
      return; 
    return await this.commonPasswordRepository.insert({
      password: password,
    });
  }
}
