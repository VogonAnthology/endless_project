import { Controller, Get, Query, Req } from '@nestjs/common';
import { ContestsService } from './contests.service';
import { ContestDto } from 'src/dto/contest.dto';

@Controller('contests')
export class ContestsController {
  constructor(private readonly contestsService: ContestsService) {}

  @Get()
  async find(@Query() query: { id: number }, @Req() req): Promise<ContestDto> {
    console.log('ContestsController.find query:', req.user);
    return await this.contestsService.getContestDTO(query.id, req.user?.id);
  }
}
