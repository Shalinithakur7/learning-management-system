import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) { }

  login(data: any) {
    return this.http.post<any>(`${this.apiUrl}/login`, data).pipe(
      tap(res => localStorage.setItem('token', res.token))
    );
  }
  getRole(): string | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      if (Array.isArray(roleClaim)) {
        return roleClaim[0]; // Return first role if multiple
      }
      return roleClaim || null;
    } catch {
      return null;
    }
  }

  getRoles(): string[] {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || payload.role;
      if (Array.isArray(roleClaim)) {
        return roleClaim;
      }
      return roleClaim ? [roleClaim] : [];
    } catch {
      return [];
    }
  }

  hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }
  register(data: any) {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('token');
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
