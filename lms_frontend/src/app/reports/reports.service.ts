import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CourseEnrollmentReportDto {
    courseId: number;
    courseTitle: string;
    totalEnrollments: number;
}

export interface StudentCourseGroupDto {
    courseId: number;
    courseTitle: string;
    studentNames: string[];
}

export interface AssignmentSubmissionReportDto {
    assignmentId: number;
    assignmentTitle: string;
    courseTitle: string;
    totalSubmissions: number;
    totalStudents: number;
    pendingSubmissions: number;
}

export interface StudentProgressReportDto {
    studentId: string;
    studentName: string;
    studentEmail: string;
    courseId: number;
    courseTitle: string;
    totalLessons: number;
    completedLessons: number;
    progressPercentage: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReportsService {
    private apiUrl = `${environment.apiUrl}/reports`;

    constructor(private http: HttpClient) { }

    getEnrollmentStats(): Observable<CourseEnrollmentReportDto[]> {
        return this.http.get<CourseEnrollmentReportDto[]>(`${this.apiUrl}/enrollments`);
    }

    getStudentsByCourse(): Observable<StudentCourseGroupDto[]> {
        return this.http.get<StudentCourseGroupDto[]>(`${this.apiUrl}/students-by-course`);
    }

    getSubmissionStats(): Observable<AssignmentSubmissionReportDto[]> {
        return this.http.get<AssignmentSubmissionReportDto[]>(`${this.apiUrl}/submissions`);
    }

    getStudentProgress(courseId?: number): Observable<StudentProgressReportDto[]> {
        const url = courseId ? `${this.apiUrl}/progress?courseId=${courseId}` : `${this.apiUrl}/progress`;
        return this.http.get<StudentProgressReportDto[]>(url);
    }
}
