import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CourseEnrollmentReport } from './course-enrollment-report';

describe('CourseEnrollmentReport', () => {
  let component: CourseEnrollmentReport;
  let fixture: ComponentFixture<CourseEnrollmentReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseEnrollmentReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CourseEnrollmentReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
