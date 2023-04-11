import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateTaskDto {
  @ApiProperty({
    example: 'Prepare UI',
    minLength: 1,
    maxLength: 255,
    nullable: false,
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 1,
    minimum: 0,
    nullable: false,
    required: false,
  })
  remaining?: number;
}

export const UpdateTaskSchema = Joi.object().keys({
  id: Joi.any().strip(),
  name: Joi.string().max(255),
  category: Joi.any().strip(),
  remaining: Joi.number().min(0),
  dateAssigned: Joi.any().strip(),
  dateActive: Joi.any().strip(),
  dateEnded: Joi.any().strip(),
  dateCreated: Joi.any().strip(),
  dateUpdated: Joi.any().strip(),
  storyId: Joi.any().strip(),
  story: Joi.any().strip(),
});