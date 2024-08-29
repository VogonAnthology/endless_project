import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VideosExploreScrolldownComponent } from './videos-explore-scrolldown.component';

describe('VideosExploreScrolldownComponent', () => {
  let component: VideosExploreScrolldownComponent;
  let fixture: ComponentFixture<VideosExploreScrolldownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VideosExploreScrolldownComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VideosExploreScrolldownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
