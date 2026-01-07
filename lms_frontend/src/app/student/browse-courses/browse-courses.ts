import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EnrollmentService } from '../../services/enrollment.service';
import { CourseService, Course } from '../../services/course.service';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-browse-courses',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule
    ],
    templateUrl: './browse-courses.html',
    styleUrl: './browse-courses.css'
})
export class BrowseCoursesComponent implements OnInit {
    courses: Course[] = [];
    loading = true;
    enrollingCourseId: string | null = null;
    myEnrollmentsMap: Map<number, any> = new Map();

    constructor(
        private courseService: CourseService,
        private enrollmentService: EnrollmentService,
        private snackBar: MatSnackBar,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) { }

    ngOnInit() {
        this.loadCourses();
    }

    loadCourses() {
        this.loading = true;

        forkJoin({
            courses: this.courseService.getAllCourses(),
            enrollments: this.enrollmentService.getMyEnrollments()
        }).subscribe({
            next: (data) => {
                // Filter to show only APPROVED courses
                this.courses = data.courses.filter(c =>
                    c.status && c.status.toUpperCase() === 'APPROVED'
                );

                // Map enrollments for easy lookup
                this.myEnrollmentsMap.clear();
                data.enrollments.forEach(e => {
                    this.myEnrollmentsMap.set(e.courseId, e);
                });

                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading data', err);
                this.loading = false;
                this.cdr.detectChanges();
                this.snackBar.open('Error loading courses', 'Close', { duration: 3000 });
            }
        });
    }

    getEnrollmentStatus(courseId: number): string | null {
        const enrollment = this.myEnrollmentsMap.get(courseId);
        return enrollment ? enrollment.status : null;
    }

    handleCourseAction(course: Course) {
        const status = this.getEnrollmentStatus(course.id);

        if (status && status.toUpperCase() === 'APPROVED') {
            this.ngZone.run(() => {
                this.router.navigate(['/student/course', course.id]);
            });
        } else if (status && status.toUpperCase() === 'PENDING') {
            // Do nothing
        } else {
            // Not enrolled or Rejected -> Enroll logic
            this.enrollInCourse(course);
        }
    }

    enrollInCourse(course: Course) {
        this.enrollingCourseId = course.id.toString();

        this.enrollmentService.enrollInCourse(course.id.toString()).subscribe({
            next: () => {
                this.snackBar.open('Enrollment request sent! Waiting for instructor approval.', 'Close', {
                    duration: 4000
                });
                this.enrollingCourseId = null;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error enrolling', err);
                const errorMsg = err.error?.message || 'Error enrolling in course. Please try again.';
                this.snackBar.open(errorMsg, 'Close', {
                    duration: 3000
                });
                this.enrollingCourseId = null;
                this.cdr.detectChanges();
            }
        });
    }

    isEnrolling(courseId: number): boolean {
        return this.enrollingCourseId === courseId.toString();
    }

    getButtonText(course: Course): string {
        if (this.isEnrolling(course.id)) return 'Enrolling...';
        const status = this.getEnrollmentStatus(course.id);
        if (!status) return 'Enroll Now';
        if (status.toUpperCase() === 'APPROVED') return 'View Course';
        if (status.toUpperCase() === 'PENDING') return 'Pending Approval';
        if (status.toUpperCase() === 'REJECTED') return 'Re-Enroll';
        return 'Enroll Now';
    }

    getButtonIcon(course: Course): string {
        if (this.isEnrolling(course.id)) return 'hourglass_empty';
        const status = this.getEnrollmentStatus(course.id);
        if (!status) return 'add';
        if (status.toUpperCase() === 'APPROVED') return 'play_circle_filled';
        if (status.toUpperCase() === 'PENDING') return 'schedule';
        if (status.toUpperCase() === 'REJECTED') return 'refresh';
        return 'add';
    }

    isButtonDisabled(course: Course): boolean {
        if (this.isEnrolling(course.id)) return true;
        const status = this.getEnrollmentStatus(course.id);
        if (status && status.toUpperCase() === 'PENDING') return true;
        return false;
    }

    backToDashboard() {
        this.router.navigate(['/student/dashboard']);
    }
}
