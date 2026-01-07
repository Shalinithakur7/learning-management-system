import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentProgressReport } from './student-progress-report';

describe('StudentProgressReport', () => {
  let component: StudentProgressReport;
  let fixture: ComponentFixture<StudentProgressReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentProgressReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentProgressReport);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
