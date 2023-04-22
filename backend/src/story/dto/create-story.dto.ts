import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateStoryDto {

  @ApiProperty({
    example: 'This is sample title',
    minLength: 1,
    maxLength: 128,
    type: String,
    required: true
  })
  title: string;

  @ApiProperty({
    example: 'This is sample description',
    minLength: 1,
    required: true
  })
  description: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
    default: 1,
    required: true
  })
  sequenceNumber: number;

  @ApiProperty({
    example: ['Test1', 'Test2'],
    required: true
  })
  tests: string[];

  @ApiProperty({
    description: 'Priority',
    example: 3,
    minimum: 0,
    maximum: 3,
    default: 3,
    type: Number,
    required: true
  })
  priority: number;

  @ApiProperty({
    description: 'Business value',
    example: 5,
    minimum: 0,
    maximum: 10,
    default: 5,
    type: Number,
    required: true
  })
  businessValue: number;
}

export const CreateStorySchema = Joi.object().keys({
  id: Joi.any().strip(),
  title: Joi.string().trim().min(1).max(128).required(),
  description: Joi.string().trim().min(1).required(),
  sequenceNumber: Joi.number().greater(0).min(1).required().default(1),
  tests: Joi.array().items(Joi.string()),
  priority: Joi.number().required().default(3),
  businessValue: Joi.number().greater(-1).less(11).required().default(5),
});

