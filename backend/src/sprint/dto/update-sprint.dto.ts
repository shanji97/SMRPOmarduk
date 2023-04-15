import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateSprintDto {
  @ApiProperty({
    example: 'Sample sprint',
    minLength: 1,
    maxLength: 255,
    nullable: false,
    required: false,
  })
  name: string;

  @ApiProperty({
    example: 1,
    minimum: 0,
    nullable: false,
    required: false,
  })
  velocity: number;

  @ApiProperty({
    example: '2023-01-01',
    format: 'date',
    nullable: false,
    required: false,
  })
  startDate: string;

  @ApiProperty({
    example: '2023-01-02',
    format: 'date',
    nullable: false,
    required: false,
  })
  endDate: string;
}

export const UpdateSprintSchema = Joi.object().keys({
  id: Joi.any().strip(),
  name: Joi.string().max(255),
  velocity: Joi.number().min(0),
  startDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  projectId: Joi.any().strip(),
  project: Joi.any().strip(),
});
