import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, UpdateUserRequest, UpdatePreferencesRequest, AssignRoleRequest, PreferredTheme, PreferredLanguage } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);

  getMe(): Observable<UserResponse> {
    return this.http.get<UserResponse>('/api/users/me');
  }

  updateMe(data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>('/api/users/me', data);
  }

  updatePreferences(data: UpdatePreferencesRequest): Observable<UserResponse> {
    return this.http.patch<UserResponse>('/api/users/me/preferences', data);
  }

  updatePreferredTheme(theme: PreferredTheme): Observable<UserResponse> {
    return this.updatePreferences({ preferredTheme: theme });
  }

  updatePreferredLanguage(language: PreferredLanguage): Observable<UserResponse> {
    return this.updatePreferences({ preferredLanguage: language });
  }

  getAllUsers(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>('/api/users');
  }

  getUserById(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`/api/users/${id}`);
  }

  updateUser(id: number, data: UpdateUserRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`/api/users/${id}`, data);
  }

  deleteUser(id: number): Observable<Record<string, string>> {
    return this.http.delete<Record<string, string>>(`/api/users/${id}`);
  }

  assignRole(id: number, data: AssignRoleRequest): Observable<UserResponse> {
    return this.http.put<UserResponse>(`/api/users/${id}/role`, data);
  }
}
