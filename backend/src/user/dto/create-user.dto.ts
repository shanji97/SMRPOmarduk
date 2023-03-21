import { ApiProperty} from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateUserDto {

  @ApiProperty({
    example: 'John',
    minLength: 1,
    maxLength: 128,
    nullable: false,
    required: true,
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    minLength: 1,
    maxLength: 128,
    nullable: false,
    required: true,
  })
  lastName: string;

  @ApiProperty({
    example: 'jdoe',
    minLength: 0,
    maxLength: 128,
    nullable: false,
    required: true,
  })
  username: string;

  @ApiProperty({
    example: 'jdoe',
    minLength: 12,
    maxLength: 60,
    nullable: false,
    required: true,
  })
  password: string;

  @ApiProperty({
    example: 'jdoe@example.com',
    minLength: 1,
    maxLength: 255,
    nullable: false,
    required: true,
  })
  email: string;

  @ApiProperty({
    default: false,
    example: false,
    nullable: false,
    required: false,
  })
  isAdmin?: boolean;

  @ApiProperty({
    example: 'Sample description',
    minLength: 1,
    maxLength: 65535,
    nullable: true,
    required: false,
  })
  description?: string | null;
}

export const CreateUserSchema = Joi.object().keys({
  id: Joi.any().strip(),
  firstName: Joi.string().trim().min(1).max(128).required(),
  lastName: Joi.string().trim().min(1).max(128).required(),
  username: Joi.string().trim().min(1).max(128).required(),
  password: Joi.string().trim().min(12).max(64).required(),
  email: Joi.string().trim().min(1).max(255),
  twoFa: Joi.any().strip(),
  twoFaConfirmed: Joi.any().strip(),
  isAdmin: Joi.boolean(),
  deleted: Joi.any().strip(),
  description: Joi.string().trim().min(1).max(65535).allow(null),
  dateCreated: Joi.any().strip(),
  dateUpdated: Joi.any().strip(),
});
