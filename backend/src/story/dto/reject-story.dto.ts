import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class RejectStoryDto {
    @ApiProperty({
        example: 'Optional rejection description.',
        minLength: 1,
        nullable: true,
        required: false,
    })
    description?: string | null;
}

export const RejectStroySchema = Joi.object().keys({
    description: Joi.string().trim().min(1).allow(null),
});