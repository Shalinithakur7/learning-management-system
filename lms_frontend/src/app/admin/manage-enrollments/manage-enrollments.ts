import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { EnrollmentService } from '../../services/enrollment.service';

@Component({
    selector: 'app-manage-enrollments',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatTableModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatSnackBarModule,
        MatToolbarModule
    ],
    templateUrl: './manage-enrollments.html',
    styleUrl: './manage-enrollments.css'
})
export class ManageEnrollmentsComponent implements OnInit {
    displayedColumns: string[] = ['student', 'course', 'date', 'actions'];
    dataSource: any[] = [];
    loading = true;

    constructor(
        private enrollmentService: EnrollmentService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        requestAnimationFrame(() => {
            this.loadEnrollments();
        });
    }

    loadEnrollments() {
        this.loading = true;
        this.enrollmentService.getPendingEnrollments().subscribe({
            next: (data) => {
                console.log('Pending Enrollments Data:', data); // DEBUG
                this.dataSource = data;
                this.loading = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading pending enrollments', err);
                this.snackBar.open('Failed to load pending enrollments', 'Close', { duration: 3000 });
                this.loading = false;
                this.cdr.detectChanges();
            }
        });
    }

    approve(enrollment: any) {
        if (confirm(`Are you sure you want to Approve enrollment for ${enrollment.studentName}?`)) {
            this.enrollmentService.approveEnrollment(enrollment.id).subscribe({
                next: () => {
                    this.snackBar.open('Enrollment Approved!', 'Close', { duration: 3000 });
                    this.loadEnrollments(); // Reload list
                },
                error: (err) => {
                    console.error('Error approving', err);
                    this.snackBar.open('Error approving enrollment', 'Close', { duration: 3000 });
                }
            });
        }
    }

    reject(enrollment: any) {
        if (confirm(`Are you sure you want to REJECT enrollment for ${enrollment.studentName}?`)) {
            this.enrollmentService.rejectEnrollment(enrollment.id).subscribe({
                next: () => {
                    this.snackBar.open('Enrollment Rejected', 'Close', { duration: 3000 });
                    this.loadEnrollments();
                },
                error: (err) => {
                    console.error('Error rejecting', err);
                    this.snackBar.open('Error rejecting enrollment', 'Close', { duration: 3000 });
                }
            });
        }
    }
}
