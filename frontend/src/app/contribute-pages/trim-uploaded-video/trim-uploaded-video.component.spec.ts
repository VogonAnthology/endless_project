import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrimUploadedVideoComponent } from './trim-uploaded-video.component';

describe('TrimUploadedVideoComponent', () => {
  let component: TrimUploadedVideoComponent;
  let fixture: ComponentFixture<TrimUploadedVideoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrimUploadedVideoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrimUploadedVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
