import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateProjectWallNotificationCommentDto {

    @ApiProperty({
        example: 'Post content.',
        description: 'Post content.',
        minLength: 1,
        required: true
    })
    content: string;

    @ApiProperty({
        example: 'shanji',
        description: 'Authors username',
        minLength: 1,
        maxLength: 200,
        type: String,
        required: true
    })
    author: string;

    @ApiProperty({
        description: 'User id.',
        example: 1,
        minimum: 1,
        default: 1,
        type: Number,
        required: true
    })
    userId: number;
}

export const CreateProjectWallNotificationCommentSchema = Joi.object().keys({
    content: Joi.string().min(1).required().default('Work on a project.'),
    author: Joi.string().min(1).max(200).default('shanji'),
    userId: Joi.number().min(1).required().default(1)
});

