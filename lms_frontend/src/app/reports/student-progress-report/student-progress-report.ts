import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-student-progress-report',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  templateUrl: './student-progress-report.html'
})
export class StudentProgressReportComponent implements OnInit {
  data: any[] = [];

  constructor(private service: ReportService) {}

  ngOnInit() {
    this.service.studentProgress().subscribe(res => this.data = res);
  }
}
