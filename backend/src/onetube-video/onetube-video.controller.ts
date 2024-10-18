import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('onetube-video')
export class OnetubeVideoController {
  //   @Public()
  //   @Get()
  //   async loadMetadata(@Query() query: { id: number }): Promise<OnetubeVideoDto> {
  //     return await this.onetubeVideoService.getOnetubeVideoDTO(query.id);
  //   }
}
/*
a:1-20
b:21-40
c:41-60
d:61-80

total: 80

inversé:
d:
80-80 départ
80-61 fin



*/
