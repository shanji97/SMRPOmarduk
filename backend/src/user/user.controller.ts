import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateUserDto, CreateUserSchema } from './dto/create-user.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { UpdateUserDto, UpdateUserSchema } from './dto/update-user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';
import { ValidationException } from '../common/exception/validation.exception';

@ApiTags('user')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
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
  @Get(':userId')
  async getUser(@Param('userId', ParseIntPipe) userId: number): Promise<User> {
    const user = await this.userService.getUserById(userId);
    if (!user)
      throw new NotFoundException('User not found');
    return user;
  }

  @ApiOperation({ summary: 'Create user' })
  @ApiCreatedResponse()
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
  @Patch(':userId')
  async updateUser(@Param('userId', ParseIntPipe) userId: number, @Body(new JoiValidationPipe(UpdateUserSchema)) user: UpdateUserDto) {
    try {
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
  async deleteUser(@Param('userId', ParseIntPipe) userId: number) {
    await this.userService.deleteUserById(userId);
  }
}
