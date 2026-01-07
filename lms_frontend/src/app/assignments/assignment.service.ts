import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AssignmentService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Get assignments by course
  getByCourse(courseId: number) {
    return this.http.get<any[]>(`${this.api}/Assignments/${courseId}`);
  }

  // Get all assignments for instructor
  getMyAssignments() {
    return this.http.get<any[]>(`${this.api}/Assignments/my`);
  }

  // Get single assignment
  getById(id: number) {
    return this.http.get<any>(`${this.api}/Assignments/${id}`);
  }

  // Create assignment
  create(data: any) {
    return this.http.post(`${this.api}/Assignments`, data);
  }

  // Update assignment
  update(id: number, data: any) {
    return this.http.put(`${this.api}/Assignments/${id}`, data);
  }

  // Delete assignment
  delete(id: number) {
    return this.http.delete(`${this.api}/Assignments/${id}`);
  }

  // Student submission
  submit(data: any) {
    return this.http.post(`${this.api}/Submissions`, data);
  }

  // Get student's submissions
  mySubmissions() {
    return this.http.get<any[]>(`${this.api}/Submissions/my`);
  }

  // Get submissions for an assignment (instructor)
  getSubmissions(assignmentId: number) {
    return this.http.get<any[]>(`${this.api}/Submissions/assignment/${assignmentId}`);
  }
}
