import { BadRequestException, Body, Controller, Delete, Get, ForbiddenException, HttpCode, NotFoundException, Param, ParseBoolPipe, ParseIntPipe, Patch, Post, UseGuards, InternalServerErrorException, HttpException, ParseFloatPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBadRequestResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { PlanningPokerRound } from './planning-poker-round.entity';
import { PlanningPokerService } from './planning-poker.service';
import { StoryService } from './story.service';
import { Token } from '../auth/decorator/token.decorator';
import { TokenDto } from '../auth/dto/token.dto';
import { UserRole } from '../project/project-user-role.entity';
import { ValidationException } from '../common/exception/validation.exception';
import { PlanningPokerVote } from './planning-poker-vote.entity';

@ApiTags('planning-pocker')
@ApiBearerAuth()
@ApiUnauthorizedResponse()
@UseGuards(AuthGuard('jwt'))
@Controller('planning-pocker')
export class PlanningPokerController {
  constructor(
    private readonly planningPokerService: PlanningPokerService,
    private readonly storyService: StoryService,
  ) {}
  
  @ApiOperation({ summary: 'List planning poker rounds for story' })
  @ApiOkResponse()
  @Get('story/:storyId')
  async listPlanningPockerRoundsForStory(
    @Token() token: TokenDto,
    @Param('storyId', ParseIntPipe) storyId: number,
  ): Promise<PlanningPokerRound[]> {
    if (!token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();

    return await this.planningPokerService.getRoundsForStory(storyId);
  }

  @ApiOperation({ summary: 'Get planning poker round' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':roundId')
  async getPlanningPockerRound(
    @Token() token: TokenDto,
    @Param('roundId', ParseIntPipe) roundId: number,
  ) {
    if (!token.isAdmin && !await this.planningPokerService.hasUserPermissionForRound(token.sid, roundId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();

    const round = await this.planningPokerService.getRoundById(roundId);
    if (!round)
      throw new NotFoundException();
    if (!round.dateEnded && !token.isAdmin && !await this.planningPokerService.hasUserPermissionForRound(token.sid, roundId, [UserRole.ScrumMaster]))
      return round;
    return await this.planningPokerService.getRoundById(roundId, true);
  }

  @ApiOperation({ summary: 'Get active planning poker round' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get('story/:storyId/active')
  async getActivePlanningPockerRound(
    @Token() token: TokenDto,
    @Param('storyId', ParseIntPipe) storyId: number,
  ) {
    if (!token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();

    const round = await this.planningPokerService.getActiveRoundForStory(storyId);
    if (!round)
      throw new NotFoundException();
    if (!round.dateEnded && !token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId, [UserRole.ScrumMaster]))
      return round;
    return await this.planningPokerService.getActiveRoundForStory(storyId, true);
  }

  @ApiOperation({ summary: 'Start new planning poker for story' })
  @ApiCreatedResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @Post(':storyId')
  async startPlanningPockerRound(
    @Token() token: TokenDto,
    @Param('storyId', ParseIntPipe) storyId: number,
  ): Promise<void> {
    if (!token.isAdmin && !await this.storyService.hasUserPermissionForStory(token.sid, storyId, [UserRole.ScrumMaster]))
      throw new ForbiddenException();
    
    try {
      await this.planningPokerService.startRound(storyId);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'End planning poker for story' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @HttpCode(200)
  @Post(':roundId/end/:acceptResult')
  async endPlanningPokerRound(
    @Token() token: TokenDto,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('acceptResult', ParseBoolPipe) acceptResult: boolean,
  ): Promise<void> {
    if (!token.isAdmin && !await this.planningPokerService.hasUserPermissionForRound(token.sid, roundId, [UserRole.ScrumMaster]))
      throw new ForbiddenException();

    try {
      await this.planningPokerService.endRound(roundId, acceptResult)
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }

  @ApiOperation({ summary: 'Get planning poker vote for round' })
  @ApiOkResponse()
  @ApiNotFoundResponse()
  @Get(':roundId/vote')
  async getVoteOnPlannigPokerRound(
    @Token() token: TokenDto,
    @Param('roundId', ParseIntPipe) roundId: number,
  ): Promise<PlanningPokerVote> {
    if (!token.isAdmin && !await this.planningPokerService.hasUserPermissionForRound(token.sid, roundId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();

    const result = await this.planningPokerService.getVoteInRound(roundId, token.sid);
    if (!result)
      throw new NotFoundException();
    return result;
  }

  @ApiOperation({ summary: 'Vote on planning pocker round' })
  @ApiOkResponse()
  @ApiBadRequestResponse()
  @ApiForbiddenResponse()
  @HttpCode(200)
  @Post(':roundId/vote/:value')
  async voteOnPlanningPokerRound(
    @Token() token: TokenDto,
    @Param('roundId', ParseIntPipe) roundId: number,
    @Param('value', ParseFloatPipe) value: number,
  ): Promise<void> {
    if (!token.isAdmin && !await this.planningPokerService.hasUserPermissionForRound(token.sid, roundId, [UserRole.Developer, UserRole.ScrumMaster]))
      throw new ForbiddenException();
    
    try {
      await this.planningPokerService.voteInRound(roundId, token.sid, value);
    } catch (ex) {
      if (ex instanceof ValidationException) {
        throw new BadRequestException(ex.message);
      }
      throw ex;
    }
  }
}
