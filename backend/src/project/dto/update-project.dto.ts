import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateProjectDto {
    @ApiProperty({
        example: 1,
        minimum: 1,
        default: 1,
        type: Number,
        required: true
    })
    userId: number

    @ApiProperty({
        example: "This is sample project name.",
        minLength: 1,
        maxLength: 128,
        type: String,
        required: true
    })
    projectName: string;

    @ApiProperty({
        example: "This is sample description.",
        minLength: 1,
        nullable: true,
        required: false,
    })
    projectDescription?: string | null;
}

export const UpdateProjectSchema = Joi.object().keys({
    userId: Joi.number().greater(0).required().default(1),
    projectName: Joi.string().trim().min(1).max(128).required(),
    projectDescription: Joi.string().trim().allow(null).allow(''),
});