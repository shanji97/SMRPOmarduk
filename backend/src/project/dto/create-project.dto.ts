import { ApiProperty } from '@nestjs/swagger';
import * as Joi from 'joi';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';


export class CreateProjectDto {

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
    type: String,
    required: true
  })
  projectDescription: string;
  
  @ApiProperty({
    example: [{ userId: 3 , role: [2,3] }, { userId: 1, role: [1]}],
    required: true
  })
  members: CreateMemberDto[];
  
}

export const CreateProjectSchema = Joi.object().keys({
  id: Joi.any().strip(),
  projectName: Joi.string().trim().min(1).max(128).required(),
  projectDescription: Joi.string().trim().required(),
  members: Joi.array().items(Joi.object().keys({
    userId: Joi.number().min(1).required(),
    role: Joi.array().items(Joi.number().greater(-1).less(3).required())
  }))
});