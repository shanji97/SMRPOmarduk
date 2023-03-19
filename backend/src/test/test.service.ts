import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';

import { Test } from './test.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class TestService {
    private readonly logger: Logger = new Logger(TestService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(Test)
        private readonly testRepository: Repository<Test>,
    ) { }

    async getAllTests(): Promise<Test[]> {
        return await this.testRepository.find();
    }

    async getTestById(testId: number): Promise<Test> {
        return await this.testRepository.findOneBy({ id: testId });
    }

    async createTest(storyId: number, testName: string[]) {
        try {
            for (let i = 0; i < testName.length; i++) {
                let testToInsert = new Test();
                testToInsert.name = testName[i];
                await this.testRepository.insert(testToInsert);
            }
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Testname already exists');
                }
            }
        }
    }

    async updateTestById(testId, test) {
        try {
            await this.testRepository.update({ id: testId }, test);
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Testname already exists');
                }
            }
        }
    }

    async deleteTestById(testId: number) {
        await this.testRepository.delete({ id: testId });
    }
}
