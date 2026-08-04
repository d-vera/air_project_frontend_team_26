import { Injectable, signal, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from './user.service';
import { PreferredLanguage } from '../../models/user.model';

export type Language = 'es' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private translate = inject(TranslateService);
  private userService = inject(UserService);
  private readonly LANG_KEY = 'lang';

  currentLang = signal<Language>(this.initialLanguage());

  constructor() {
    const lang = this.currentLang();
    this.translate.addLangs(['es', 'en']);
    this.translate.setFallbackLang('es');
    this.translate.use(lang);
  }

  setLanguage(lang: Language, syncBackend = true): void {
    this.currentLang.set(lang);
    localStorage.setItem(this.LANG_KEY, lang);
    this.translate.use(lang);

    if (syncBackend && this.isAuthenticated()) {
      const preferredLanguage: PreferredLanguage = lang;
      this.userService.updatePreferredLanguage(preferredLanguage).subscribe({
        error: (err) => console.warn('Failed to sync language preference to backend:', err)
      });
    }
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  toggleLanguage(syncBackend = true): void {
    const nextLang: Language = this.currentLang() === 'es' ? 'en' : 'es';
    this.setLanguage(nextLang, syncBackend);
  }

  private initialLanguage(): Language {
    const savedLang = localStorage.getItem(this.LANG_KEY) as Language | null;
    if (savedLang && (savedLang === 'es' || savedLang === 'en')) {
      return savedLang;
    }
    const browserLang = navigator.language || 'es';
    return browserLang.toLowerCase().startsWith('es') ? 'es' : 'en';
  }
}
