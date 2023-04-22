import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateStoryCategoryDto {
  @ApiProperty({
    description: 'Category.',
    example: 1,
    minimum: 0,
    maximum: 2,
    default: 1,
    type: Number,
    required: true
  })
  category: number;

  @ApiProperty({
    description: 'User ID.',
    example: 1,
    minimum: 1,
    default: 1,
    type: Number,
    required: true
  })
  projectId: number;

}

export const UpdateStoryCategoryStorySchema = Joi.object().keys({
  category: Joi.number().greater(0).less(3).required().default(1),
  projectId: Joi.number().greater(0).required().default(1)
});

