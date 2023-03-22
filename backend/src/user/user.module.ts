import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CommonPassword } from './common-password.entity';
import { User } from './user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CommonPasswordController } from './common-password.controller';
import { CommonPasswordService } from './common-password.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CommonPassword,
      User,
    ]),
  ],
  controllers: [
    CommonPasswordController,
    UserController,
  ],
  providers: [
    CommonPasswordService,
    UserService,
  ],
  exports: [
    UserService,
  ]
})
export class UserModule {}
