import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApproveEnrollment } from './approve-enrollment';

describe('ApproveEnrollment', () => {
  let component: ApproveEnrollment;
  let fixture: ComponentFixture<ApproveEnrollment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApproveEnrollment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApproveEnrollment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
