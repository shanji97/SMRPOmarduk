import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateSprintDto {
  @ApiProperty({
    example: 'Sample sprint',
    minLength: 1,
    maxLength: 255,
    nullable: false,
    required: true
  })
  name: string;

  @ApiProperty({
    example: 1,
    minimum: 0,
    nullable: false,
    required: true,
  })
  velocity: number;

  @ApiProperty({
    example: '2023-01-01',
    format: 'date',
    nullable: false,
    required: true
  })
  startDate: string;

  @ApiProperty({
    example: '2023-01-02',
    format: 'date',
    nullable: false,
    required: true
  })
  endDate: string;
}

export const CreateSprintSchema = Joi.object().keys({
  id: Joi.any().strip(),
  name: Joi.string().max(255).required(),
  velocity: Joi.number().min(0).required(),
  startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
  endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/).required(),
  projectId: Joi.any().strip(),
  project: Joi.any().strip(),
});
