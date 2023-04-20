import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateTaskDto {
    @ApiProperty({
        example: 'This is a simple notification.',
        minLength: 1,
        nullable: false,
        required: true,
    })
    notificationString: string;

    @ApiProperty({
        example: 1,
        minimum: 0,
        nullable: false,
        required: true,
    })
    createdByUser: number;
}

export const CreateTaskSchema = Joi.object().keys({
    notificationString: Joi.string().trim().min(1).required(),
    createdByUser: Joi.number().min(1).default(1).required(),
});