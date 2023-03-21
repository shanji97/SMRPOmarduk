import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { string } from 'joi';

export class UpdateStoryDto {
  @ApiProperty({
    example: "This is sample title",
    minLength: 1,
    maxLength: 128,
    type: String,
    required: true
  })
  title: string;

  @ApiProperty({
    example: "This is sample description",
    minLength: 1,
    required: true
  })
  description: string;

  @ApiProperty({
    example: ["Test1", "Test2"],
    required: true
  })
  tests: string[];

  @ApiProperty({
    description: "Priority",
    example: 3,
    minimum: 0,
    maximum: 3,
    default: 3,
    type: Number,
    required: true
  })
  priority: number;

  @ApiProperty({
    description: "Business value",
    example: 5,
    minimum: 0,
    maximum: 10,
    default: 5,
    type: Number,
    required: true
  })
  businessValue: number;
}

export const UpdateStorySchema = Joi.object().keys({
  id: Joi.any().strip(),
  title: Joi.string().trim().min(1).max(128).required(),
  description: Joi.string().trim().min(5).required(),
  tests: Joi.any,
  priority: Joi.number().required().default(3),
  businessValue: Joi.number().greater(-1).less(11).required().default(5)
});
