import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserManagementDto {
    id: string;
    fullName: string;
    email: string;
    requestedRole: string | null;
    currentRole: string;
    status: string;
    rejectionReason: string | null;
}

export interface RejectUserDto {
    reason: string;
}

export interface ChangeRoleDto {
    newRole: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserManagementService {
    private apiUrl = `${environment.apiUrl}/UserManagement`;

    constructor(private http: HttpClient) { }

    getAllUsers(): Observable<UserManagementDto[]> {
        return this.http.get<UserManagementDto[]>(`${this.apiUrl}/users`);
    }

    approveUser(userId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/approve`, {});
    }

    rejectUser(userId: string, reason: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/reject`, { reason });
    }

    changeUserRole(userId: string, newRole: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/role`, { newRole });
    }

    blockUser(userId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/block`, {});
    }

    unblockUser(userId: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/users/${userId}/unblock`, {});
    }
}
