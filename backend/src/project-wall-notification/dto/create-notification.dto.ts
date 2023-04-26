import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateProjectWallNotificationDto {

    @ApiProperty({
        example: 'Title.',
        description: 'Title.',
        minLength: 1,
        type: String,
        required: true
    })
    title: string;

    @ApiProperty({
        example: 'Post content.',
        description: 'Post content.',
        minLength: 1,
        required: true
    })
    postContent: string;

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

export const CreateProjectWallNotificationSchema = Joi.object().keys({
    title: Joi.string().min(1).max(200).required().default('Work on a project.'),
    postContent: Joi.string().trim().min(5).required(),
    author: Joi.string().min(1).max(200).default('shanji'),
    userId: Joi.number().min(1).required().default(1)
});

