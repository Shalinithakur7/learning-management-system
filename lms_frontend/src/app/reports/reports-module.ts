import { NgModule } from '@angular/core';
import { ReportsRoutingModule } from './reports-routing-module';
import { CourseEnrollmentReportComponent } from './course-enrollment-report/course-enrollment-report';
import { StudentProgressReportComponent } from './student-progress-report/student-progress-report';
import { AssignmentSubmissionReportComponent } from './assignment-submission-report/assignment-submission-report';

@NgModule({
  imports: [
    ReportsRoutingModule,
    CourseEnrollmentReportComponent,
    StudentProgressReportComponent,
    AssignmentSubmissionReportComponent
  ]
})
export class ReportsModule {}
