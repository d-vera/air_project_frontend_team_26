import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { UserPreferenceService } from '../../core/services/user-preference.service';
import { ThemeService, ThemeMode } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { Language, Theme, PreferenceResponse } from '../../models/user-preference.model';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.css']
})
export class PreferencesComponent implements OnInit {
  preferenceService = inject(UserPreferenceService);
  themeService = inject(ThemeService);
  languageService = inject(LanguageService);

  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  preferenceId = signal<number | null>(null);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.fetchPreferences();
  }

  fetchPreferences(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.preferenceService.getPreferences().subscribe({
      next: (pref: PreferenceResponse) => {
        this.preferenceId.set(pref.id);

        if (pref.theme) {
          this.themeService.setThemeMode(pref.theme, false);
        }
        if (pref.language) {
          this.languageService.setLanguage(pref.language, false);
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.warn('Could not load preferences from API, using defaults:', err);
        this.loading.set(false);
      }
    });
  }

  onSelectTheme(mode: ThemeMode): void {
    if (this.themeService.themeMode() === mode) return;
    this.themeService.setThemeMode(mode, true);
    this.showSuccess('PREFERENCES.SAVE_SUCCESS');
  }

  onSelectLanguage(lang: Language): void {
    if (this.languageService.currentLangPreference() === lang) return;
    this.languageService.setLanguage(lang, true);
    this.showSuccess('PREFERENCES.SAVE_SUCCESS');
  }

  private showSuccess(msgKey: string): void {
    this.successMessage.set(msgKey);
    setTimeout(() => {
      if (this.successMessage() === msgKey) {
        this.successMessage.set(null);
      }
    }, 3000);
  }
}
