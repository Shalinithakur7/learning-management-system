import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EnrollmentService } from '../enrollment.service';

@Component({
  selector: 'app-approve-enrollment',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './approve-enrollment.html'
})
export class ApproveEnrollmentComponent implements OnInit {
  enrollments: any[] = [];

  constructor(private service: EnrollmentService) {}

  ngOnInit() {
    this.service.pending().subscribe(res => {
      this.enrollments = res;
    });
  }

  approve(id: number) {
    if (confirm('Approve this enrollment?')) {
      this.service.approve(id).subscribe(() => {
        this.enrollments = this.enrollments.filter(e => e.id !== id);
      });
    }
  }
}
