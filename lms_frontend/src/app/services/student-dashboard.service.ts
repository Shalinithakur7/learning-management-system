import { Injectable } from '@angular/core';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnrollmentService } from './enrollment.service';

export interface DashboardStats {
    enrolledCourses: number;
    pendingAssignments: number;
    lessonsCompleted: number;
    averageProgress: number;
}

@Injectable({
    providedIn: 'root'
})
export class StudentDashboardService {
    constructor(private enrollmentService: EnrollmentService) { }

    getDashboardStats(): Observable<DashboardStats> {
        return this.enrollmentService.getMyEnrollments().pipe(
            map(enrollments => {
                const approvedEnrollments = enrollments.filter(e => e.status === 'APPROVED');
                const validEnrollments = enrollments.filter(e => e.status !== 'Rejected' && e.status !== 'REJECTED');

                const totalProgress = approvedEnrollments.reduce((sum, e) => sum + e.progress, 0);
                const avgProgress = approvedEnrollments.length > 0
                    ? Math.round(totalProgress / approvedEnrollments.length)
                    : 0;

                return {
                    enrolledCourses: validEnrollments.length,
                    pendingAssignments: 5, // TODO: Get from assignments service
                    lessonsCompleted: 12, // TODO: Get from lesson completion service
                    averageProgress: avgProgress
                };
            })
        );
    }

    getEnrolledCourses(): Observable<any[]> {
        return this.enrollmentService.getMyEnrollments();
    }
}
