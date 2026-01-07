import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Course {
    id: number;
    title: string;
    description: string;
    price: number;
    instructorName?: string;
    status: string;
    modules?: Module[];
}

export interface Module {
    id: number;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    id: number;
    title: string;
    content?: string;
    videoUrl?: string;
}

@Injectable({
    providedIn: 'root'
})
export class CourseService {
    private apiUrl = `${environment.apiUrl}/courses`;

    constructor(private http: HttpClient) { }

    getAllCourses(): Observable<Course[]> {
        return this.http.get<Course[]>(this.apiUrl);
    }

    getCourseById(id: number): Observable<Course> {
        return this.http.get<Course>(`${this.apiUrl}/${id}`);
    }
}
