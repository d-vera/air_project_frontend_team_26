import { Injectable, signal, inject } from '@angular/core';
import { UserPreferenceService } from './user-preference.service';
import { ThemePreference } from '../../models/user-preference.model';

export type ThemeMode = ThemePreference; // 'DARK' | 'LIGHT' | 'SYSTEM'
export type LegacyTheme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';
  private preferenceService = inject(UserPreferenceService);

  themeMode = signal<ThemeMode>(this.initialThemeMode());
  isDarkMode = signal<boolean>(false);

  private mediaQuery = typeof window !== 'undefined' && window.matchMedia
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  private mediaQueryListener = (e: MediaQueryListEvent) => {
    if (this.themeMode() === 'SYSTEM') {
      this.applyDarkMode(e.matches);
    }
  };

  constructor() {
    if (this.mediaQuery) {
      if (this.mediaQuery.addEventListener) {
        this.mediaQuery.addEventListener('change', this.mediaQueryListener);
      } else {
        // Fallback for older browsers
        this.mediaQuery.addListener(this.mediaQueryListener);
      }
    }
    this.updateThemeRendering(this.themeMode());
  }

  setThemeMode(mode: ThemeMode, syncBackend = true): void {
    this.themeMode.set(mode);
    localStorage.setItem(this.THEME_KEY, mode);
    this.updateThemeRendering(mode);

    if (syncBackend && this.isAuthenticated()) {
      this.preferenceService.updatePreferences({ theme: mode }).subscribe({
        error: (err) => console.warn('Failed to sync theme preference to backend:', err)
      });
    }
  }

  // Legacy helper method for simple toggling
  toggleTheme(syncBackend = true): void {
    const current = this.themeMode();
    let nextMode: ThemeMode;
    if (current === 'LIGHT') {
      nextMode = 'DARK';
    } else if (current === 'DARK') {
      nextMode = 'SYSTEM';
    } else {
      nextMode = 'LIGHT';
    }
    this.setThemeMode(nextMode, syncBackend);
  }

  setTheme(theme: LegacyTheme, syncBackend = true): void {
    const mode: ThemeMode = theme === 'dark' ? 'DARK' : 'LIGHT';
    this.setThemeMode(mode, syncBackend);
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private initialThemeMode(): ThemeMode {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme === 'DARK' || savedTheme === 'dark') {
      return 'DARK';
    }
    if (savedTheme === 'LIGHT' || savedTheme === 'light') {
      return 'LIGHT';
    }
    if (savedTheme === 'SYSTEM') {
      return 'SYSTEM';
    }
    return 'SYSTEM';
  }

  private updateThemeRendering(mode: ThemeMode): void {
    let effectiveDark = false;
    if (mode === 'DARK') {
      effectiveDark = true;
    } else if (mode === 'LIGHT') {
      effectiveDark = false;
    } else {
      // SYSTEM mode: check window.matchMedia
      effectiveDark = this.mediaQuery ? this.mediaQuery.matches : false;
    }
    this.applyDarkMode(effectiveDark);
  }

  private applyDarkMode(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
