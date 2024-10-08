import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticProgressbarComponent } from './static-progressbar.component';

describe('StaticProgressbarComponent', () => {
  let component: StaticProgressbarComponent;
  let fixture: ComponentFixture<StaticProgressbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StaticProgressbarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticProgressbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
