import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CommonPasswordDto {
  @ApiProperty({
    example: 'jdoe',
    minLength: 1,
    maxLength: 255,
    nullable: false,
    required: true,
  })
  password: string;
}

export const CommonPasswordSchema = Joi.object().keys({
  password: Joi.string().trim().min(1).max(255).required(),
});
