import { Controller, Get, ForbiddenException, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { Token } from './decorator/token.decorator';
import { TokenDto } from './dto/token.dto';
import { UserLogin } from './user-login.entity';
import { UserLoginService } from './user-login.service';

@ApiTags('user-login')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('user-login')
export class UserLoginController {
  constructor(
    private readonly userLoginService: UserLoginService,
  ) {}
  
  @ApiOperation({ summary: 'Get user logins' })
  @ApiOkResponse()
  @Get(':userId')
  async getLoginsForUser(@Token() token, @Param('userId', ParseIntPipe) userId: number): Promise<UserLogin[]> {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    
    return await this.userLoginService.getLoginsForUser(userId);
  }

  @ApiOperation({ summary: 'Get user logins' })
  @ApiOkResponse()
  @Get(':userId/last')
  async getLastLoginForUser(@Token() token, @Param('userId', ParseIntPipe) userId: number): Promise<UserLogin> {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    
    return await this.userLoginService.getLastLoginForUser(userId);
  }
}
