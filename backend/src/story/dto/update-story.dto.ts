import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateStoryDto {

/*@ApiProperty({
  example: 'John',
  minLength: 1,
  maxLength: 128,
  nullable: false,
  required: false,
})
firstName?: string;

@ApiProperty({
  example: 'Doe',
  minLength: 1,
  maxLength: 128,
  nullable: false,
  required: false,
})
lastName?: string;

@ApiProperty({
  example: 'jdoe',
  minLength: 0,
  maxLength: 128,
  nullable: false,
  required: false,
})
username?: string;

@ApiProperty({
  example: 'jdoe',
  minLength: 1,
  maxLength: 60,
  nullable: false,
  required: false,
})
password?: string;

@ApiProperty({
  example: 'jdoe@example.com',
  minLength: 1,
  maxLength: 255,
  nullable: true,
  required: false,
})
email?: string | null;

@ApiProperty({
  example: 'Sample description',
  minLength: 1,
  maxLength: 65535,
  nullable: true,
  required: false,
})
description?: string | null;
*/
}

export const UpdateStorySchema = Joi.object().keys({
  id: Joi.any().strip(),
  title: Joi.string().trim().min(1).max(128).required(),
  description: Joi.string().trim().min(1).required(),
  priority: Joi.number().required()["default"](3),
  businessValue: Joi.number().greater(-1).less(11).required()["default"](5)
});
