import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private api = `${environment.apiUrl}/Reports`;

  constructor(private http: HttpClient) { }

  courseEnrollments() {
    return this.http.get<any[]>(`${this.api}/course-enrollments`);
  }

  studentProgress() {
    return this.http.get<any[]>(`${this.api}/student-progress`);
  }

  assignmentSubmissions() {
    return this.http.get<any[]>(`${this.api}/assignment-submissions`);
  }

  instructorDashboard() {
    return this.http.get<any>(`${this.api}/instructor-dashboard`);
  }
}
