import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private api = `${environment.apiUrl}/Courses`;

  constructor(private http: HttpClient) { }

  getAll() {
    return this.http.get<any[]>(this.api);
  }

  getById(id: number) {
    console.log(`Fetching course ${id} from API...`);
    return this.http.get<any>(`${this.api}/${id}`);
  }

  create(data: any) {
    return this.http.post<any>(this.api, data);
  }

  update(id: number, data: any) {
    return this.http.put<any>(`${this.api}/${id}`, data);
  }

  delete(id: number) {
    return this.http.delete(`${this.api}/${id}`);
  }

  addModule(courseId: number, data: any) {
    return this.http.post<any>(`${this.api}/${courseId}/modules`, data);
  }

  addLesson(moduleId: number, data: any) {
    return this.http.post<any>(`${this.api}/modules/${moduleId}/lessons`, data);
  }

  addLessonWithUpload(moduleId: number, formData: FormData) {
    return this.http.post<any>(`${this.api}/modules/${moduleId}/lessons/upload`, formData);
  }

  deleteModule(moduleId: number) {
    return this.http.delete(`${this.api}/modules/${moduleId}`);
  }

  deleteLesson(lessonId: number) {
    return this.http.delete(`${this.api}/lessons/${lessonId}`);
  }

  publish(courseId: number) {
    // This is legacy, but we'll keep it pointing to approval for now until Admin approval is implemented
    return this.submitForApproval(courseId);
  }

  submitForApproval(courseId: number) {
    return this.http.post<any>(`${this.api}/${courseId}/submit-for-approval`, {});
  }

  getMyCourses() {
    return this.http.get<any[]>(`${this.api}/my`);
  }
}
