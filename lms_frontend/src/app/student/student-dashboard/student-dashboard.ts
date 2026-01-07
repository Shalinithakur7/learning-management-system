import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { StudentDashboardService, DashboardStats } from '../../services/student-dashboard.service';
import { Enrollment } from '../../services/enrollment.service';

@Component({
    selector: 'app-student-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatProgressBarModule
    ],
    templateUrl: './student-dashboard.html',
    styleUrl: './student-dashboard.css'
})
export class StudentDashboardComponent implements OnInit {
    stats: DashboardStats = {
        enrolledCourses: 0,
        pendingAssignments: 0,
        lessonsCompleted: 0,
        averageProgress: 0
    };

    enrolledCourses: Enrollment[] = [];
    loading = true;

    constructor(
        private dashboardService: StudentDashboardService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private ngZone: NgZone
    ) { }

    ngOnInit() {
        requestAnimationFrame(() => {
            this.loadDashboard();
        });
    }

    loadDashboard() {
        this.loading = true;

        this.dashboardService.getDashboardStats().subscribe({
            next: (stats) => {
                this.stats = stats;
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading stats', err)
        });

        this.dashboardService.getEnrolledCourses().subscribe({
            next: (courses) => {
                this.enrolledCourses = courses;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading courses', err);
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    browseCourses() {
        this.router.navigate(['/student/browse-courses']);
    }

    isApproved(status: string): boolean {
        return !!status && (status.toUpperCase() === 'APPROVED' || status.toUpperCase() === 'Approved');
    }

    continueLearning(course: Enrollment) {
        if (this.isApproved(course.status)) {
            this.ngZone.run(() => {
                this.router.navigate(['/student/course', course.courseId]);
            });
        } else if (course.status && course.status.toUpperCase() === 'REJECTED') {
            // Navigate to browse courses to re-enroll
            this.router.navigate(['/student/browse-courses']);
        }
    }

    getStatusColor(status: string): string {
        if (!status) return '';
        switch (status.toUpperCase()) {
            case 'APPROVED': return 'primary';
            case 'PENDING': return 'accent';
            case 'REJECTED': return 'warn';
            default: return '';
        }
    }
}
