import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';


export class CreateMemberDto {

    @ApiProperty({
        example: 1,
        description: "This is a sample user id in the database.",
        minimum: 1,
        default: 1
    })
    userId: number;

    @ApiProperty({
        example: 0,
        description: "Developer (0), Scrum master (1), Product owner (2).",
        minimum: 0,
        maximum: 2,
        default: 1
    })
    role: number
}

export const CreateMemberSchema = Joi.object().keys({
    id: Joi.any().strip(),
    userId: Joi.number().min(1).required(),
    role: Joi.number().greater(-1).less(3).required()["default"](0)
});