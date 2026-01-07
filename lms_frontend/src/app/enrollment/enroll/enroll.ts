import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { EnrollmentService } from '../enrollment.service';

@Component({
  selector: 'app-enroll',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  templateUrl: './enroll.html'
})
export class EnrollComponent implements OnInit {
  courses: any[] = [];

  constructor(private service: EnrollmentService) {}

  ngOnInit() {
    this.service.myEnrollments().subscribe(res => {
      this.courses = res;
    });
  }

  enroll(courseId: number) {
    this.service.enroll(courseId).subscribe();
  }
}
