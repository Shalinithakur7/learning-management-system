import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private api = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Dashboard Stats
    getAdminStats(): Observable<any> {
        return this.http.get(`${this.api}/Admin/stats`);
    }

    // Users Management
    getAllUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Admin/users`);
    }

    getUserById(id: string): Observable<any> {
        return this.http.get(`${this.api}/Admin/users/${id}`);
    }

    updateUserStatus(userId: string, isActive: boolean): Observable<any> {
        return this.http.put(`${this.api}/Admin/users/${userId}/status`, { isActive });
    }

    updateUserRole(userId: string, role: string): Observable<any> {
        return this.http.put(`${this.api}/Admin/users/${userId}/role`, { role });
    }

    deleteUser(userId: string): Observable<any> {
        return this.http.delete(`${this.api}/Admin/users/${userId}`);
    }

    // Courses Management
    getAllCourses(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Admin/courses`);
    }

    approveCourse(courseId: number): Observable<any> {
        return this.http.put(`${this.api}/Admin/courses/${courseId}/approve`, {});
    }

    rejectCourse(courseId: number, reason: string): Observable<any> {
        return this.http.put(`${this.api}/Admin/courses/${courseId}/reject`, { reason });
    }

    archiveCourse(courseId: number): Observable<any> {
        return this.http.put(`${this.api}/Admin/courses/${courseId}/archive`, {});
    }

    // Categories Management
    getCategories(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Categories`);
    }

    createCategory(data: any): Observable<any> {
        return this.http.post(`${this.api}/Categories`, data);
    }

    updateCategory(id: number, data: any): Observable<any> {
        return this.http.put(`${this.api}/Categories/${id}`, data);
    }

    deleteCategory(id: number): Observable<any> {
        return this.http.delete(`${this.api}/Categories/${id}`);
    }

    // Enrollments Management
    getAllEnrollments(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Admin/enrollments`);
    }

    // Reports
    getReports(): Observable<any> {
        return this.http.get(`${this.api}/Admin/reports`);
    }

    getCoursesPerCategory(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Admin/reports/courses-per-category`);
    }

    getUserDistribution(): Observable<any> {
        return this.http.get(`${this.api}/Admin/reports/user-distribution`);
    }

    getEnrollmentsPerCourse(): Observable<any[]> {
        return this.http.get<any[]>(`${this.api}/Admin/reports/enrollments-per-course`);
    }
}
