import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class CreateTestDto {

    @ApiProperty({
        example: "This is sample description",
        minLength: 1,
        required: true
    })
    description: string;

    @ApiProperty({
        description: "The id of the story",
        example: 1,
        type: Number,
        required: true
    })
    storyId: number;
}

export const CreateTestSchema = Joi.object().keys({
    id: Joi.any().strip(),
    storyId: Joi.number().greater(-1),
    description: Joi.string().trim().min(1).required(),
});
