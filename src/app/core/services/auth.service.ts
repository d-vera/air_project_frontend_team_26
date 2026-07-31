import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../models/auth.model';
import { UserRole } from '../../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'user_role';
  private readonly EMAIL_KEY = 'user_email';

  token = signal<string | null>(this.getStoredToken());
  email = signal<string | null>(this.getStoredEmail());
  role = signal<UserRole | null>(this.getStoredRole());

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(res => this.saveAuthData(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(res => this.saveAuthData(res))
    );
  }

  logout(): Observable<unknown> {
    return this.http.post('/api/auth/logout', {}).pipe(
      tap({
        next: () => this.clearAuthData(),
        error: () => this.clearAuthData()
      })
    );
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  getUserRole(): UserRole | null {
    return this.role();
  }

  getUserEmail(): string | null {
    return this.email();
  }

  isAdmin(): boolean {
    return this.role() === 'ADMIN';
  }

  private saveAuthData(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    if (response.role) localStorage.setItem(this.ROLE_KEY, response.role);
    if (response.email) localStorage.setItem(this.EMAIL_KEY, response.email);

    this.token.set(response.token);
    this.role.set(response.role);
    this.email.set(response.email);
  }

  public clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    localStorage.removeItem(this.EMAIL_KEY);

    this.token.set(null);
    this.role.set(null);
    this.email.set(null);
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private getStoredEmail(): string | null {
    return localStorage.getItem(this.EMAIL_KEY);
  }

  private getStoredRole(): UserRole | null {
    return localStorage.getItem(this.ROLE_KEY) as UserRole | null;
  }
}
