import { Test, TestingModule } from '@nestjs/testing';
import { ContestingVideoService } from './contesting-video.service';

describe('ContestingVideoService', () => {
  let service: ContestingVideoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContestingVideoService],
    }).compile();

    service = module.get<ContestingVideoService>(ContestingVideoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
