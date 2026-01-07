import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private api = `${environment.apiUrl}/Enrollments`;

  constructor(private http: HttpClient) { }

  enroll(courseId: number) {
    return this.http.post(this.api, { courseId });
  }

  myEnrollments() {
    return this.http.get<any[]>(`${this.api}/my`);
  }

  pending() {
    return this.http.get<any[]>(`${this.api}/pending`);
  }

  approve(id: number) {
    return this.http.put(`${this.api}/approve/${id}`, {});
  }
}
