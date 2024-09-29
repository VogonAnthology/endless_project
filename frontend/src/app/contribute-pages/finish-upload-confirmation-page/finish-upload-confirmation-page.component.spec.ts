import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinishUploadConfirmationPageComponent } from './finish-upload-confirmation-page.component';

describe('FinishUploadConfirmationPageComponent', () => {
  let component: FinishUploadConfirmationPageComponent;
  let fixture: ComponentFixture<FinishUploadConfirmationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinishUploadConfirmationPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FinishUploadConfirmationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
