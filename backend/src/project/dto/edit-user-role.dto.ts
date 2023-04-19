import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class UpdateSuperiorUser {
    @ApiProperty({
        example: 1,
        minimum: 1,
        default: 1,
        type: Number,
        required: true
    })
    newUserId: number

}

export const UpdateSuperiorUserSchema = Joi.object().keys({
    newUserId: Joi.number().greater(0).required().default(1),
});