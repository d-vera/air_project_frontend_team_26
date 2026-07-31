import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';

  isDarkMode = signal<boolean>(this.initialDarkMode());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggleTheme(): void {
    const newMode = !this.isDarkMode();
    this.isDarkMode.set(newMode);
    localStorage.setItem(this.THEME_KEY, newMode ? 'dark' : 'light');
    this.applyTheme(newMode);
  }

  setTheme(theme: Theme): void {
    const isDark = theme === 'dark';
    this.isDarkMode.set(isDark);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(isDark);
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
