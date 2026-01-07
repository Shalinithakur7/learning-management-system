import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Enrollment {
    id: number;
    studentId: string;
    courseId: number;
    courseName: string;
    instructorName: string;
    status: string;
    progress: number;
    enrolledDate: Date;
    completedLessonIds?: number[];
}

export interface EnrollmentRequest {
    courseId: number;
}

@Injectable({
    providedIn: 'root'
})
export class EnrollmentService {
    private apiUrl = `${environment.apiUrl}/enrollments`;

    constructor(private http: HttpClient) { }

    // Get student's enrollments
    getMyEnrollments(): Observable<Enrollment[]> {
        return this.http.get<Enrollment[]>(`${this.apiUrl}/my`);
    }

    // Enroll in a course (creates PENDING enrollment)
    enrollInCourse(courseId: string): Observable<any> {
        return this.http.post(`${this.apiUrl}`, { courseId: parseInt(courseId) });
    }

    // Get enrollment status for a specific course
    getEnrollmentStatus(courseId: string): Observable<Enrollment | null> {
        return this.getMyEnrollments().pipe(
            map(enrollments => {
                const enrollment = enrollments.find(e => e.courseId.toString() === courseId);
                return enrollment || null;
            })
        );
    }

    // Get approved enrollments only
    getApprovedEnrollments(): Observable<Enrollment[]> {
        return this.getMyEnrollments().pipe(
            map(enrollments => enrollments.filter(e =>
                e.status.toUpperCase() === 'APPROVED' || e.status === 'Approved'
            ))
        );
    }

    // Mark a lesson as complete
    completeLesson(courseId: number, lessonId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${courseId}/complete/${lessonId}`, {});
    }

    // --- Admin Methods ---

    // Get all pending enrollments
    getPendingEnrollments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/pending`).pipe(
            map(data => data.map(item => ({
                id: item.id || item.Id,
                studentName: item.studentName || item.StudentName,
                studentEmail: item.studentEmail || item.StudentEmail,
                courseTitle: item.courseTitle || item.CourseTitle,
                enrolledOn: item.enrolledOn || item.EnrolledOn,
                status: item.status || item.Status,
                studentId: item.studentId || item.StudentId,
                courseId: item.courseId || item.CourseId
            })))
        );
    }

    // Approve an enrollment
    approveEnrollment(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/approve/${id}`, {});
    }

    // Reject an enrollment
    rejectEnrollment(id: number): Observable<any> {
        return this.http.put(`${this.apiUrl}/reject/${id}`, {});
    }
}
