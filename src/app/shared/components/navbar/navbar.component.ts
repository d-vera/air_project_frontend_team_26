import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, ThemeToggleComponent, LanguageToggleComponent],
  template: `
    <header class="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      <div class="flex items-center space-x-3">
        <!-- Hamburger button for mobile/tablet -->
        <button
          (click)="toggleSidebar.emit()"
          type="button"
          class="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle navigation sidebar"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div class="flex items-center space-x-3">
          <img
            src="assets/images/logo.jpg"
            alt="Project Aeolus Logo"
            class="w-9 h-9 rounded-full object-cover shadow-sm border border-slate-200 dark:border-slate-700/80 md:hidden"
          />
          <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Project Aeolus
          </h2>
        </div>
      </div>

      <!-- Right Header Actions -->
      <div class="flex items-center space-x-2">
        <app-language-toggle></app-language-toggle>
        <app-theme-toggle></app-theme-toggle>

        @if (authService.isAuthenticated()) {
          <div class="hidden sm:flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div class="w-8 h-8 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              {{ userInitial }}
            </div>
          </div>
        } @else {
          <div class="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <a
              routerLink="/login"
              class="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-xs"
            >
              {{ 'AUTH.LOGIN_BUTTON' | translate }}
            </a>
          </div>
        }
      </div>
    </header>
  `
})
export class NavbarComponent {
  authService = inject(AuthService);

  @Output() toggleSidebar = new EventEmitter<void>();

  get userInitial(): string {
    const email = this.authService.getUserEmail();
    return email ? email.charAt(0).toUpperCase() : 'U';
  }
}
