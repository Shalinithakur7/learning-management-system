import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EnrollmentReportComponent } from './enrollment-report/enrollment-report.component';
import { StudentsByCourseComponent } from './students-by-course/students-by-course.component';
import { SubmissionReportComponent } from './submission-report/submission-report.component';
import { ProgressReportComponent } from './progress-report/progress-report.component';
import { AuthGuard } from '../core/auth/auth-guard';

const routes: Routes = [
    {
        path: 'enrollments',
        component: EnrollmentReportComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Instructor'] }
    },
    {
        path: 'students-by-course',
        component: StudentsByCourseComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Instructor'] }
    },
    {
        path: 'submissions',
        component: SubmissionReportComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Instructor'] }
    },
    {
        path: 'progress',
        component: ProgressReportComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin', 'Instructor'] }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule { }
