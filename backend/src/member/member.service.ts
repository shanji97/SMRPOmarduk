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

    hasValidProjectOwner(projectMembers: CreateMemberDto[]): Boolean {
        const hasOnlyProductOwnerRole = (member: CreateMemberDto) => member.role.length === 1 && member.role[0] === 2;
        const hasProductOwnerRole = (member: CreateMemberDto) => member.role.includes(2);
        return projectMembers.some(hasOnlyProductOwnerRole) && projectMembers.every(member => !hasProductOwnerRole(member) || hasOnlyProductOwnerRole(member));
    }

    isScrumMasterAndDeveloperPresent(projectMembers: CreateMemberDto[]): Boolean {

        let roles: number[] = [1, 2];

        let scrumMasterCount: number = 0;
        let developerCount: number = 0;

        projectMembers.forEach(member => {
            member.role.forEach(memberRole => {
                if (memberRole == 1) {
                    scrumMasterCount++;
                } else if (memberRole == 0) {
                    developerCount++;
                }

                if (scrumMasterCount > 0 && developerCount > 0) {
                    return true;
                }
            })
        });
        // Check if all roles are present. We need one product manager, at least one scrum master and at least one developer

        return false;
    }

    createMemberObject(projectId: number, userId: number, role: number): Member {
        let newMember = new Member();
        newMember.projectId = projectId;
        newMember.userId = userId;
        newMember.role = role;
        return newMember;
    }
}