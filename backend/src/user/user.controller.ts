import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
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
      if (!token.isAdmin && token.sid !== userId) // Don't allow normal user to update other users data
        throw new ForbiddenException();

      await this.userService.updateUserById(userId, user);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Delete user' })
  @ApiOkResponse()
  @AdminOnly()
  @Delete(':userId')
  async deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    await this.userService.deleteUserById(userId);
  }
}
