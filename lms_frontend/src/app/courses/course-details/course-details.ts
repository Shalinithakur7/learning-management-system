import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { finalize } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CourseService } from '../course.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-course-details',
  standalone: true,
  templateUrl: './course-details.html',
  styleUrls: ['./course-details.css'],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatListModule,
    MatChipsModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    RouterModule
  ],
  providers: []
})
export class CourseDetailsComponent {
  course: any;
  selectedLesson: any = null;

  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    console.log('Course ID from route:', id);

    // Mock Data for Dummy Courses
    const dummyData: any = {
      101: {
        id: 101,
        title: 'Angular Basics',
        description: 'Learn Angular from scratch. This is a comprehensive guide to building web applications with Angular.',
        price: 49.99,
        instructorId: 'dummy-instructor',
        isPublished: true,
        modules: [
          { title: 'Introduction', lessons: [{ title: 'What is Angular?', type: 'video', content: 'Video content here' }, { title: 'Setup', type: 'text', content: 'Setup instructions' }] },
          { title: 'Components', lessons: [{ title: 'Creating Components', type: 'video', content: 'Component video' }] }
        ]
      },
      102: {
        id: 102, title: 'React Advanced', description: 'Master React patterns and hooks.', price: 59.99, isPublished: false, status: 'Pending',
        modules: [{ title: 'Hooks Deep Dive', lessons: [] }]
      },
      103: { id: 103, title: 'Python for Data Science', description: 'Data analysis with Python.', price: 39.99, isPublished: false, status: 'Draft', modules: [] },
      104: { id: 104, title: 'Rejected Course', description: 'This course was rejected.', price: 0, isPublished: false, status: 'Rejected', rejectionReason: 'Content too short', modules: [] }
    };

    if (dummyData[id]) {
      console.log('Loading dummy course:', id);
      this.course = dummyData[id];
      return;
    }

    if (id) {
      this.courseService.getById(id)
        .pipe(finalize(() => {
          console.log('Request finalized');
          this.cdr.detectChanges(); // Force update
        }))
        .subscribe({
          next: (res) => {
            console.log('Course loaded:', res);
            this.course = res;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading course:', err);
            this.snackBar.open('Failed to load course details.', 'Close');
          }
        });
    } else {
      this.snackBar.open('Invalid Course ID', 'Close');
    }
  }

  viewLesson(lesson: any) {
    this.selectedLesson = lesson;
  }

  closeLesson() {
    this.selectedLesson = null;
  }
}
