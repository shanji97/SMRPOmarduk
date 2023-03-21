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
    example: [{ userId: 1, role: 1 }, { userId: 1, role: 2 }],
    required: true
  })
  members: CreateMemberDto[];

}

export const CreateProjectSchema = Joi.object().keys({
  id: Joi.any().strip(),
  projectName: Joi.string().trim().min(1).max(128).required(),
  members: Joi.array()
});