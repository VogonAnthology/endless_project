import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadVideoPageComponent } from './upload-video-page.component';

describe('UploadVideoPageComponent', () => {
  let component: UploadVideoPageComponent;
  let fixture: ComponentFixture<UploadVideoPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadVideoPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadVideoPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
