import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { CourseService } from '../course.service';
import { AuthService } from '../../core/auth/auth';

@Component({
  selector: 'app-course-list',
  standalone: true,
  templateUrl: './course-list.html',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule
  ]
})
export class CourseListComponent implements OnInit {

  courses: any[] = [];
  filter = '';
  isAdmin = false;

  constructor(
    private courseService: CourseService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.auth.hasRole('Admin');
    this.loadCourses();
  }

  loadCourses(): void {
    this.courseService.getAll().subscribe({
      next: res => this.courses = res,
      error: () => {
        this.courses = [
          { id: 1, title: 'Web Development' },
          { id: 2, title: 'Machine Learning' }
        ];
      }
    });
  }

  filteredCourses() {
    return this.courses.filter(c =>
      c.title.toLowerCase().includes(this.filter.toLowerCase())
    );
  }

  viewCourse(id: number): void {
    this.router.navigate(['/courses', id]);
  }

  deleteCourse(id: number): void {
    const confirmed = confirm('Are you sure you want to delete this course?');
    if (!confirmed) return;

    this.courseService.delete(id).subscribe({
      next: () => {
        this.courses = this.courses.filter(c => c.id !== id);
      }
    });
  }
}
