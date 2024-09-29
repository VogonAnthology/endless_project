import { TestBed } from '@angular/core/testing';

import { UploadedVideoService } from './video.service';

describe('VideoService', () => {
  let service: UploadedVideoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadedVideoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
