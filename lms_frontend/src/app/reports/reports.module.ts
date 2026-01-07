import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { ReportsService } from './reports.service';

// Components
import { EnrollmentReportComponent } from './enrollment-report/enrollment-report.component';
import { StudentsByCourseComponent } from './students-by-course/students-by-course.component';
import { SubmissionReportComponent } from './submission-report/submission-report.component';
import { ProgressReportComponent } from './progress-report/progress-report.component';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@NgModule({
    imports: [
        CommonModule,
        ReportsRoutingModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatExpansionModule,
        MatProgressBarModule,
        MatCardModule,
        MatIconModule,
        MatListModule,
        EnrollmentReportComponent,
        StudentsByCourseComponent,
        SubmissionReportComponent,
        ProgressReportComponent
    ],
    providers: [ReportsService]
})
export class ReportsModule { }
