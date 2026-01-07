import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CourseEnrollmentReportComponent } from './course-enrollment-report/course-enrollment-report';
import { StudentProgressReportComponent } from './student-progress-report/student-progress-report';
import { AssignmentSubmissionReportComponent } from './assignment-submission-report/assignment-submission-report';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
  { path: 'course-enrollments', canActivate: [AuthGuard], component: CourseEnrollmentReportComponent },
  { path: 'student-progress', canActivate: [AuthGuard], component: StudentProgressReportComponent },
  { path: 'assignment-submissions', canActivate: [AuthGuard], component: AssignmentSubmissionReportComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule {}
