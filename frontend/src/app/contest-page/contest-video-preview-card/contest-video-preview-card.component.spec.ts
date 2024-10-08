import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContestVideoPreviewCardComponent } from './contest-video-preview-card.component';

describe('ContestVideoPreviewCardComponent', () => {
  let component: ContestVideoPreviewCardComponent;
  let fixture: ComponentFixture<ContestVideoPreviewCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContestVideoPreviewCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContestVideoPreviewCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
