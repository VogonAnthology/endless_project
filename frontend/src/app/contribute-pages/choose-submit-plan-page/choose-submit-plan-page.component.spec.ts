import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseSubmitPlanPageComponent } from './choose-submit-plan-page.component';

describe('ChooseSubmitPlanPageComponent', () => {
  let component: ChooseSubmitPlanPageComponent;
  let fixture: ComponentFixture<ChooseSubmitPlanPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChooseSubmitPlanPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChooseSubmitPlanPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
