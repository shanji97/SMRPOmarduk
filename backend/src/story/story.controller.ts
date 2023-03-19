import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateStoryDto, CreateStorySchema } from './dto/create-story.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { UpdateStoryDto, UpdateStorySchema } from './dto/update-story.dto';
import { Story } from './story.entity';
import { StoryService } from './story.service';
import { TestService } from '../test/test.service';
import { ValidationException } from '../common/exception/validation.exception';

// Posebej controller za teste
// returnaj story id
//vsakem testu dodati story id.

@ApiTags('story')
//@ApiBearerAuth()
//@ApiUnauthorizedResponse()
//@UseGuards(AuthGuard('jwt'))
@Controller('story')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly testService: TestService,
  ) { }

  @ApiOperation({ summary: 'List stories' })
  @ApiOkResponse()
  @Get()
  async listStorys(): Promise<Story[]> {
    return await this.storyService.getAllStories();
  }

  @ApiOperation({ summary: 'Get story by ID' })
  @ApiOkResponse()
  @Get(':storyId')
  async getStory(@Param('storyId', ParseIntPipe) storyId: number): Promise<Story> {
    const story = await this.storyService.getStoryById(storyId);
    if (!story)
      throw new NotFoundException('Story not found');
    return story;
  }

  @ApiOperation({ summary: 'Create story' })
  @ApiCreatedResponse()
  @Post()
  async createStory(@Body(new JoiValidationPipe(CreateStorySchema)) story: CreateStoryDto) {
    try {
      const row = await this.storyService.createStory(story);
      const storyId = (JSON.parse(JSON.stringify(row)).id);

      await this.testService.createTest(storyId, story.tests);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex.message);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Update story' })
  @ApiOkResponse()
  @Patch(':storyId')
  async updateStory(@Param('storyId', ParseIntPipe) storyId: number, @Body(new JoiValidationPipe(UpdateStorySchema)) story: UpdateStoryDto) {
    try {
      await this.storyService.updateStoryById(storyId, story);
    } catch (ex) {
      if (ex instanceof ValidationException)
        throw new BadRequestException(ex);
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Delete story' })
  @ApiOkResponse()
  @Delete(':storyId')
  async deleteStory(@Param('storyId', ParseIntPipe) storyId: number) {
    await this.storyService.deleteStoryById(storyId);
  }
}
