import { Injectable, signal, inject, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../models/auth.model';
import { UserRole } from '../../models/user.model';
import { UserService } from './user.service';
import { ThemeService, ThemeMode } from './theme.service';
import { LanguageService } from './language.service';
import { UserPreferenceService } from './user-preference.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private injector = inject(Injector);

  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY = 'user_role';
  private readonly EMAIL_KEY = 'user_email';

  token = signal<string | null>(this.getStoredToken());
  email = signal<string | null>(this.getStoredEmail());
  role = signal<UserRole | null>(this.getStoredRole());

  constructor() {
    if (this.isAuthenticated()) {
      this.loadUserPreferences();
    }
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/login', credentials).pipe(
      tap(res => {
        this.saveAuthData(res);
        this.loadUserPreferences();
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/auth/register', data).pipe(
      tap(res => {
        this.saveAuthData(res);
        this.loadUserPreferences();
      })
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

  loadUserPreferences(): void {
    if (!this.isAuthenticated()) return;

    const preferenceService = this.injector.get(UserPreferenceService);
    const themeService = this.injector.get(ThemeService);
    const languageService = this.injector.get(LanguageService);

    preferenceService.getPreferences().subscribe({
      next: (pref) => {
        if (pref.theme) {
          themeService.setThemeMode(pref.theme, false);
        }
        if (pref.language) {
          languageService.setLanguage(pref.language, false);
        }
      },
      error: (err) => {
        console.warn('Failed to load user preferences from backend:', err);
      }
    });
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

