import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateStoryBacklogDto {

  @ApiProperty({
    description: 'Backlog.',
    example: 1,
    minimum: 0,
    maximum: 2,
    default: 1,
    type: Number,
    required: true
  })
  backlog: number;
  
  @ApiProperty({
    description: 'Project id.',
    example: 1,
    minimum: 1,
    default: 1,
    type: Number,
    required: true
  })
  projectId: number;

}

export const UpdateStoryBacklogSchema = Joi.object().keys({
  backlog: Joi.number().min(0).max(2).required().default(1),
  projectId: Joi.number().min(1).required().default(1)
});

