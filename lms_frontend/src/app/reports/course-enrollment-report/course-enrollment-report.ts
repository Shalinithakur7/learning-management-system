import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-course-enrollment-report',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './course-enrollment-report.html'
})
export class CourseEnrollmentReportComponent implements OnInit {
  data: any[] = [];

  constructor(private service: ReportService) {}

  ngOnInit() {
    this.service.courseEnrollments().subscribe(res => this.data = res);
  }
}
