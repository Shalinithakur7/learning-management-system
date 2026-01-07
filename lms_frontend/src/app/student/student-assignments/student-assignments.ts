import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Assignment {
    id: string;
    title: string;
    courseName: string;
    dueDate: Date;
    status: 'PENDING' | 'SUBMITTED' | 'GRADED';
    grade?: number;
}

@Component({
    selector: 'app-student-assignments',
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatButtonModule,
        MatIconModule,
        MatChipsModule,
        MatTableModule,
        MatSnackBarModule
    ],
    templateUrl: './student-assignments.html',
    styleUrl: './student-assignments.css'
})
export class StudentAssignmentsComponent implements OnInit {
    assignments: Assignment[] = [];
    displayedColumns: string[] = ['title', 'course', 'dueDate', 'status', 'actions'];
    loading = true;

    constructor(
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit() {
        this.loadAssignments();
    }

    loadAssignments() {
        this.loading = true;

        // TODO: Replace with actual API call
        // Only show assignments for APPROVED courses
        setTimeout(() => {
            this.assignments = [
                {
                    id: '1',
                    title: 'Angular Components Exercise',
                    courseName: 'Angular Fundamentals',
                    dueDate: new Date('2024-02-15'),
                    status: 'PENDING'
                },
                {
                    id: '2',
                    title: 'TypeScript Generics Assignment',
                    courseName: 'TypeScript Advanced',
                    dueDate: new Date('2024-02-20'),
                    status: 'PENDING'
                },
                {
                    id: '3',
                    title: 'RxJS Operators Practice',
                    courseName: 'RxJS Mastery',
                    dueDate: new Date('2024-02-10'),
                    status: 'SUBMITTED'
                },
                {
                    id: '4',
                    title: 'Angular Services Quiz',
                    courseName: 'Angular Fundamentals',
                    dueDate: new Date('2024-01-30'),
                    status: 'GRADED',
                    grade: 95
                },
                {
                    id: '5',
                    title: 'Observable Patterns',
                    courseName: 'RxJS Mastery',
                    dueDate: new Date('2024-02-25'),
                    status: 'PENDING'
                }
            ];
            this.loading = false;
            this.cdr.detectChanges(); // Fix double-click / NG0100
        }, 500);
    }

    submitAssignment(assignment: Assignment) {
        // TODO: Implement actual submission logic
        this.snackBar.open('Assignment submission feature coming soon!', 'Close', {
            duration: 3000
        });
    }

    viewAssignment(assignment: Assignment) {
        // TODO: Navigate to assignment details
        this.snackBar.open(`Viewing ${assignment.title}`, 'Close', {
            duration: 2000
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'PENDING': return 'warn';
            case 'SUBMITTED': return 'accent';
            case 'GRADED': return 'primary';
            default: return '';
        }
    }

    isOverdue(dueDate: Date): boolean {
        return new Date(dueDate) < new Date();
    }

    getDaysUntilDue(dueDate: Date): number {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    }
}
