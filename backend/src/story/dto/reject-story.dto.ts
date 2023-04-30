import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';

export class StoryNotificationDto {
    @ApiProperty({
        example: 'Description.',
        minLength: 1,
        required: true
    })
    description: string;
}

export const StoryNotificationSchema = Joi.object().keys({
    description: Joi.string().trim().min(1).required().default('Zavrnitev storyja s strani product ownerja.'),
});