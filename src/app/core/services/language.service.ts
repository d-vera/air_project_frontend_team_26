import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from './user-preference.service';
import { LanguagePreference } from '../../models/user-preference.model';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private preferenceService = inject(UserPreferenceService);
  private readonly LANG_KEY = 'lang';

  currentLang = signal<Language>(this.initialLanguage());
  currentLangPreference = signal<LanguagePreference>(this.currentLang() === 'es' ? 'ES' : 'EN');

  constructor() {
    const lang = this.currentLang();
    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');
    this.translate.use(lang);
  }

  setLanguage(langInput: Language | LanguagePreference | string, syncBackend = true): void {
    const uppercase: LanguagePreference = String(langInput).toUpperCase() === 'EN' ? 'EN' : 'ES';
    const lowercase: Language = uppercase === 'EN' ? 'en' : 'es';

    this.currentLang.set(lowercase);
    this.currentLangPreference.set(uppercase);
    localStorage.setItem(this.LANG_KEY, lowercase);
    this.translate.use(lowercase);

    if (syncBackend && this.isAuthenticated()) {
      this.preferenceService.updatePreferences({ language: uppercase }).subscribe({
        error: (err) => console.warn('Failed to sync language preference to backend:', err)
      });
    }
  }

  toggleLanguage(syncBackend = true): void {
    const nextLang: LanguagePreference = this.currentLangPreference() === 'ES' ? 'EN' : 'ES';
    this.setLanguage(nextLang, syncBackend);
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private initialLanguage(): Language {
    const savedLang = localStorage.getItem(this.LANG_KEY);
    if (savedLang) {
      const normalized = savedLang.toLowerCase();
      if (normalized === 'es' || normalized === 'en') {
        return normalized as Language;
      }
    }
    const browserLang = typeof navigator !== 'undefined' ? (navigator.language || 'es') : 'es';
    return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
}
