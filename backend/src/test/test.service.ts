import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { StoryTest } from './test.entity';
import { ValidationException } from '../common/exception/validation.exception';

@Injectable()
export class TestService {
    private readonly logger: Logger = new Logger(TestService.name);

    constructor(
        private readonly configService: ConfigService,
        @InjectRepository(StoryTest)
        private readonly testRepository: Repository<StoryTest>,
    ) { }

    async getAllTests(): Promise<StoryTest[]> {
        return await this.testRepository.find();
    }

    async getTestById(testId: number): Promise<StoryTest> {
        return await this.testRepository.findOneBy({ id: testId });
    }

    async getTestsByStory(storyId: number): Promise<StoryTest[]> {
        return await this.testRepository.findBy({ storyId: storyId });
    }

    async createTest(storyId: number, testName: string[]) {
        try {
            for (let i = 0; i < testName.length; i++) {
                let testToInsert = new StoryTest();
                testToInsert.description = testName[i];
                testToInsert.storyId = storyId;
                await this.testRepository.insert(testToInsert);
            }
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Test name already exists.');
                }
            }
        }
    }

    async updateTestById(testId: number, test) {
        try {
            await this.testRepository.update({ id: testId }, test);
        } catch (ex) {
            if (ex instanceof QueryFailedError) {
                switch (ex.driverError.errno) {
                    case 1062: // Duplicate entry
                        throw new ValidationException('Test name already exists.');
                }
            }
        }
    }

    async realizeTestById(testId: number){
        await this.testRepository.update({id:testId}, {isRealized: true});
    }

    async deleteTestById(testId: number) {
        await this.testRepository.delete({ id: testId });
    }
}
