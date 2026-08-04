import { Injectable, signal, inject } from '@angular/core';
import { UserService } from './user.service';
import { PreferredTheme } from '../../models/user.model';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private userService = inject(UserService);

  isDarkMode = signal<boolean>(this.initialDarkMode());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggleTheme(syncBackend = true): void {
    const newMode = !this.isDarkMode();
    this.setTheme(newMode ? 'dark' : 'light', syncBackend);
  }

  setTheme(theme: Theme, syncBackend = true): void {
    const isDark = theme === 'dark';
    this.isDarkMode.set(isDark);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(isDark);

    if (syncBackend && this.isAuthenticated()) {
      const preferredTheme: PreferredTheme = isDark ? 'DARK' : 'LIGHT';
      this.userService.updatePreferredTheme(preferredTheme).subscribe({
        error: (err) => console.warn('Failed to sync theme preference to backend:', err)
      });
    }
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private initialDarkMode(): boolean {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  private applyTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
