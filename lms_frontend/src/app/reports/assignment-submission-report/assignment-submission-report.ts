import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-assignment-submission-report',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './assignment-submission-report.html'
})
export class AssignmentSubmissionReportComponent implements OnInit {
  data: any[] = [];

  constructor(private service: ReportService) {}

  ngOnInit() {
    this.service.assignmentSubmissions().subscribe(res => this.data = res);
  }
}
