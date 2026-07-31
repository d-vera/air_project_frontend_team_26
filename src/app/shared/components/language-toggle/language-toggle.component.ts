import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center space-x-1 p-1 bg-slate-200/60 dark:bg-slate-800/80 rounded-xl">
      <button
        (click)="setLang('es')"
        type="button"
        [class.bg-white]="langService.currentLang() === 'es'"
        [class.dark:bg-slate-700]="langService.currentLang() === 'es'"
        [class.text-sky-600]="langService.currentLang() === 'es'"
        [class.dark:text-sky-400]="langService.currentLang() === 'es'"
        [class.shadow-xs]="langService.currentLang() === 'es'"
        [class.text-slate-600]="langService.currentLang() !== 'es'"
        [class.dark:text-slate-400]="langService.currentLang() !== 'es'"
        class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus:outline-none"
      >
        ES
      </button>
      <button
        (click)="setLang('en')"
        type="button"
        [class.bg-white]="langService.currentLang() === 'en'"
        [class.dark:bg-slate-700]="langService.currentLang() === 'en'"
        [class.text-sky-600]="langService.currentLang() === 'en'"
        [class.dark:text-sky-400]="langService.currentLang() === 'en'"
        [class.shadow-xs]="langService.currentLang() === 'en'"
        [class.text-slate-600]="langService.currentLang() !== 'en'"
        [class.dark:text-slate-400]="langService.currentLang() !== 'en'"
        class="px-2.5 py-1 text-xs font-semibold rounded-lg transition-all focus:outline-none"
      >
        EN
      </button>
    </div>
  `
})
export class LanguageToggleComponent {
  langService = inject(LanguageService);

  setLang(lang: Language): void {
    this.langService.setLanguage(lang);
  }
}
