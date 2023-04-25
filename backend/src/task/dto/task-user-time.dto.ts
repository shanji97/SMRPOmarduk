import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class TaskUserTimeDto {
   @ApiProperty({
    example: 1,
    minimum: 0,
    nullable: false,
    required: true,
  })
  spent: number;

  @ApiProperty({
    example: 1,
    minimum: 0,
    nullable: false,
    required: true,
  })
  remaining: number;

  @ApiProperty({
    example: 'Prepare UI',
    minLength: 0,
    maxLength: 65535,
    nullable: true,
    required: false,
  })
  description?: string | null;
}

export const TaskUserTimeSchema = Joi.object().keys({
  date: Joi.any().strip(),
  taskId: Joi.any().strip(),
  task: Joi.any().strip(),
  userId: Joi.any().strip(),
  user: Joi.any().strip(),

  spent: Joi.number().min(0).required(),
  remaining: Joi.number().min(0).required(),
  description: Joi.string().max(65535).allow(null),
  
  dateCreated: Joi.any().strip(),
  dateUpdated: Joi.any().strip(),
});
