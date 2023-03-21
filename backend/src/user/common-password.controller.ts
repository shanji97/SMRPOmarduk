import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CommonPasswordDto, CommonPasswordSchema } from './dto/common-password.dto';
import { CommonPasswordService } from './common-password.service';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';

@ApiTags('common-password')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('common-password')
export class CommonPasswordController {
  constructor(
    private readonly commonPasswordService: CommonPasswordService,
  ) {}

  @ApiOperation({ summary: 'Check if password is among common passwords' })
  @ApiOkResponse()
  @HttpCode(200)
  @Post()
  async checkPassword(@Body(new JoiValidationPipe(CommonPasswordSchema)) data: CommonPasswordDto): Promise<{ isCommon: boolean }> {
    return {
      isCommon: await this.commonPasswordService.checkIfPasswordIsCommon(data.password),
    };
  }
}
