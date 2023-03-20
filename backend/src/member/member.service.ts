import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Member } from './member.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { CreateMemberDto } from './dto/create-member.dto';


@Injectable()
export class MemberService {
    private readonly logger: Logger = new Logger(MemberService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Member)
        private readonly memberRepository: Repository<Member>,
    ) { }

    async getAllMembers(): Promise<Member[]> {
        return await this.memberRepository.find();
    }

    async getMemberById(memberId: number): Promise<Member> {
        return await this.memberRepository.findOneBy({ id: memberId });
    }

    async createMember(projectId: number, newMember: CreateMemberDto[]) {
        try {
            for (let i = 0; i < newMember.length; i++) {
                let member = new Member();
                member.projectId = projectId;
                member.userId = newMember[i].userId;
                member.role = newMember[i].role;

                await this.memberRepository.insert(member);
            }
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Membername already exists');
                }
            }
        }
    }

    async updateMemberById(memberId, member) {
        try {
            await this.memberRepository.update({ id: memberId }, member);
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Member name already exists');
                }
            }
        }
    }

    async deleteMemberById(memberId: number) {
        await this.memberRepository.delete({ id: memberId });
    }
}