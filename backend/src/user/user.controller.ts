import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, InternalServerErrorException, HttpCode, HttpException } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { AdminOnly } from '../auth/decorator/admin-only.decorator';
import { AdminOnlyGuard } from '../auth/guard/admin-only.guard';
import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { Token } from '../auth/decorator/token.decorator';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ValidationException } from '../common/exception/validation.exception';

@ApiTags('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'), AdminOnlyGuard)
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}
  
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse()
  @Get()
  async listUsers(): Promise<User[]> {
    return await this.userService.getAllUsers();
  }

  @ApiOperation({ summary: 'Get user by ID' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':userId')
  async getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    const user = await this.userService.getUserById(userId);
    if (!user)
      throw new NotFoundException('User not found');
    return user;
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @AdminOnly()
  @Post()
  async createUser(@Body(new JoiValidationPipe(CreateUserSchema)) user: CreateUserDto) {
    try {
      await this.userService.createUser(user);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Patch(':userId')
  async updateUser(@Token() token, @Param('userId', ParseIntPipe) userId: number, @Body(new JoiValidationPipe(UpdateUserSchema)) user: UpdateUserDto) {
    try {
      if (!token.isAdmin) { // Non-admin user => chaning own info
        if (token.sid !== userId) // Don't allow normal user to update other users data
          throw new ForbiddenException();
      }
      if (user.password && (!token.isAdmin || token.sid === userId)) { // If changing password, user must enter also old one
        const passwordOld: string = await this.userService.getUserPassword(token.sid);
        if (!passwordOld || !await this.userService.comparePassword(user.passwordOld || '', passwordOld))
          throw new BadRequestException('Wrong current password');
      }
      if (user.passwordOld) // Delete non-ORM field
        delete user.passwordOld;
      await this.userService.updateUserById(userId, user);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse()
  @Delete(':userId')
  async deleteUser(@Token() token, @Param('userId', ParseIntPipe) userId: number) {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    await this.userService.deleteUserById(userId);
  }

  @ApiOperation({ summary: 'Setup 2FA for user '})
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Post(':userId/2fa')
  async enable2FA(@Token() token, @Param('userId', ParseIntPipe) userId: number): Promise<{ secret: string, url: string }> {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    
    if (await this.userService.hasUser2FA(userId))
      throw new ForbiddenException('User already has 2FA enabled');
        
    try {
      const secret = this.userService.create2FASecret();
      const url = this.userService.create2FAURL(token.sub, 'SMRPO', secret);

      await this.userService.set2FASecretForUser(userId, secret);

      return {
        secret: secret,
        url: url,
      };
    } catch (ex) {
      throw new InternalServerErrorException(ex.message);
    }
  }

  @ApiOperation({ summary: 'Confirm and finally enable 2FA for user '})
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @HttpCode(200)
  @Post(':userId/2fa/:code')
  async confirm2FA(@Token() token, @Param('userId', ParseIntPipe) userId: number, @Param('code', ParseIntPipe) code: number): Promise<void> {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    
    if (!await this.userService.hasUser2FA(userId, true))
      throw new ForbiddenException('User has 2FA disabled');
        
    try {
      if (!await this.userService.confirm2FAForUser(userId, code))
        throw new BadRequestException('Invalid 2FA code');
    } catch (ex) {
      if (ex instanceof HttpException)
        throw ex;
      throw new InternalServerErrorException(ex.message);
    }
  }

  @ApiOperation({ summary: 'Disable 2FA for user '})
  @ApiOkResponse()
  @ApiForbiddenResponse()
  @Delete(':userId/2fa')
  async disable2FA(@Token() token, @Param('userId', ParseIntPipe) userId: number): Promise<void> {
    if (!token.isAdmin) // Non-admin user => chaning own info
      if (token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();
    
    try {
      await this.userService.remove2FAForUser(userId);
    } catch (ex) {
      throw new InternalServerErrorException(ex.message);
    }
  }
}
