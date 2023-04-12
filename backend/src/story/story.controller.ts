import { BadRequestException, ConflictException, Body, Controller, Delete, Get, NotFoundException, Param, ParseIntPipe, Patch, Post, UseGuards, HttpException, HttpStatus, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CreateStoryDto, CreateStorySchema } from './dto/create-story.dto';
import { JoiValidationPipe } from '../common/pipe/joi-validation.pipe';
import { UpdateStoryDto, UpdateStorySchema } from './dto/update-story.dto';
import { Story } from './story.entity';
import { StoryService } from './story.service';
import { TestService } from '../test/test.service';
import { ValidationException } from '../common/exception/validation.exception';
import { Token } from '../auth/decorator/token.decorator';
import { ProjectService } from '../project/project.service';
import { UserRole } from '../project/project-user-role.entity';

@ApiTags('story')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('story')
export class StoryController {
  constructor(
    private readonly storyService: StoryService,
    private readonly testService: TestService,
    private readonly projectService: ProjectService
  ) { }

  @ApiOperation({ summary: 'List stories' })
  @ApiOkResponse()
  @Get()
  async listStories(): Promise<Story[]> {
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
  @Post('/:projectId/add-story')
  async createStory(@Token() token, @Body(new JoiValidationPipe(CreateStorySchema)) story: CreateStoryDto, @Param('projectId', ParseIntPipe) projectId: number) {
    try {
      let hasValidRole: boolean = await this.projectService.hasUserRoleOnProject(projectId, token.sid, [UserRole.ProjectOwner, UserRole.ScrumMaster]);
      if (!hasValidRole) {
        throw new ForbiddenException('The user you are trying to add the story with is neither a scrum master nor a product owner.');
      }

      const row = await this.storyService.createStory(story, projectId);
      const storyId = row["id"];
      await this.testService.createTest(storyId, story.tests);

    } catch (ex) {
      if (ex instanceof ConflictException) {
        throw new HttpException(ex.message, HttpStatus.CONFLICT)
      } else if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
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
