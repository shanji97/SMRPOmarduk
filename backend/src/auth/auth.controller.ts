import { Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}
  
  @ApiOperation({ description: 'Login' })
  @ApiBody({ required: true, type: LoginDto })
  @ApiOkResponse({ description: 'Login succesful' })
  @ApiUnauthorizedResponse({ description: 'Login failed' })
  @UseGuards(AuthGuard('local'), AuthGuard('otp'))
  @Post('login')
  @HttpCode(200)
  async login(@Req() req) {
    return await this.authService.createTokenForUser(req.user);
  }
}
