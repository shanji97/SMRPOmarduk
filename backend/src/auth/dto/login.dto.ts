import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class LoginDto {
	@ApiProperty({
		example: 'test',
		maxLength: 60,
		required: true,
		type: String
	})
	readonly username: string;

	@ApiProperty({
		example: 'test',
		maxLength: 60,
		required: true,
		type: String
	})
	readonly password: string;
}

export const LoginSchema = Joi.object().keys({
	username: Joi.string().min(1).max(60).required(),
	password: Joi.string().min(1).max(60).required()
});

