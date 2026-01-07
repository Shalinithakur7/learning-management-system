import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private api = `${environment.apiUrl}/Progress`;

  constructor(private http: HttpClient) { }

  updateProgress(data: any) {
    return this.http.post<any>(`${this.api}/update`, data);
  }

  myProgress() {
    return this.http.get<any[]>(`${this.api}/my`);
  }
}
