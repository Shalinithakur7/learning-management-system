import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitAssignment } from './submit-assignment';

describe('SubmitAssignment', () => {
  let component: SubmitAssignment;
  let fixture: ComponentFixture<SubmitAssignment>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmitAssignment]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmitAssignment);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
