import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class LoginDto {
	@ApiProperty({
		example: 'admin',
		maxLength: 60,
		required: true,
		type: String
	})
	readonly username: string;

	@ApiProperty({
		example: 'admin',
		maxLength: 60,
		required: true,
		type: String
	})
	readonly password: string;

	@ApiProperty({
		maxLength: 6,
		minLength: 6,
		required: false,
		type: String
	})
	readonly twoFa?: string;
}

export const LoginSchema = Joi.object().keys({
	username: Joi.string().min(1).max(60).required(),
	password: Joi.string().min(1).max(60).required(),
	twoFa: Joi.string().min(6).max(6),
});

