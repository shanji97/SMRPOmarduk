import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Member } from './member.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { CreateMemberDto } from './dto/create-member.dto';
import { array } from 'joi';


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
            let newMembers: Member[];

            newMember.forEach(member => {
                member.role.forEach(memberRole => {
                    newMembers.push(this.createMemberObject(projectId, member.userId, memberRole));
                })
            });

            await this.memberRepository.insert(newMembers);

        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Member name already exists.');
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
                        throw new ValidationException('Member name already exists.');
                }
            }
        }
    }

    async deleteMemberById(memberId: number) {
        await this.memberRepository.delete({ id: memberId });
    }

    hasValidProjectOwner(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        return this.hasOneRole(projectMembers, roleForCheck) && this.hasOnlyThisRole(projectMembers, roleForCheck);
    }

    hasValidScrumMaster(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        return this.hasOneRole(projectMembers, roleForCheck);
    }

    hasAtLeastOneDeveloper(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        return this.hasAtLeastOneRole(projectMembers, roleForCheck);
    }

    hasOneRole(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        let roleCount: number = 0;
        projectMembers.forEach(newMember => {
            newMember.role.forEach(newRole => {
                if (newRole == roleForCheck) {
                    roleCount++;
                }
            });
        });

        return roleCount == 1;
    }

    hasOnlyThisRole(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        let isValid: Boolean = false;
        projectMembers.forEach(newMember => {
            if (newMember.role.length == 1) {
                if (newMember.role[0] == roleForCheck) {
                    isValid = true;
                }
            }
        });
        return isValid;
    }

    hasAtLeastOneRole(projectMembers: CreateMemberDto[], roleForCheck: number): Boolean {
        let roleCount: number = 0;
        projectMembers.forEach(newMember => {
            newMember.role.forEach(newRole => {
                if (newRole == roleForCheck) {
                    roleCount++;
                }
            });
        });
        return roleCount > 0;
    }


    createMemberObject(projectId: number, userId: number, role: number): Member {
        let newMember = new Member();
        newMember.projectId = projectId;
        newMember.userId = userId;
        newMember.role = role;
        return newMember;
    }
}