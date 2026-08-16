import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../language-toggle/language-toggle.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, ThemeToggleComponent, LanguageToggleComponent],
  template: `
    <aside class="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64 transition-all">
      <!-- App Header / Logo Showcase -->
      <div class="p-5 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40">
        <div class="flex items-center justify-between md:hidden mb-3">
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Menú</span>
          <button
            (click)="closeSidebar.emit()"
            type="button"
            class="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex flex-col items-center text-center">
          <div class="relative group cursor-pointer mb-3">
            <div class="absolute inset-0 bg-gradient-to-tr from-sky-500/25 to-indigo-500/25 rounded-full blur-md group-hover:blur-lg transition-all"></div>
            <img
              src="assets/images/logo.jpg"
              alt="Project Aeolus Logo"
              class="relative w-20 h-20 rounded-full object-cover shadow-xl border-2 border-slate-200/80 dark:border-slate-700/90 transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <h1 class="font-extrabold text-slate-900 dark:text-slate-100 text-lg leading-snug tracking-tight">Project Aeolus</h1>
          <p class="text-[11px] text-sky-600 dark:text-sky-400 font-semibold tracking-wider uppercase mt-0.5">{{ 'APP.USER_MANAGEMENT' | translate }}</p>
        </div>
      </div>

      <!-- User Information Badge -->
      <div class="p-4 mx-4 my-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-200 dark:border-sky-800 shrink-0">
          {{ userInitial }}
        </div>
        <div class="overflow-hidden">
          <p class="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
            {{ authService.getUserEmail() || 'User' }}
          </p>
          <span
            class="inline-block mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-md"
            [ngClass]="{
              'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800': authService.isAdmin(),
              'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800': !authService.isAdmin()
            }"
          >
            {{ (authService.isAdmin() ? 'ADMIN.ROLE_ADMIN' : 'ADMIN.ROLE_REGISTERED_USER') | translate }}
          </span>
        </div>
      </div>

      <!-- Navigation Links -->
      <nav class="flex-1 px-4 space-y-1 overflow-y-auto">
        <!-- Dashboard -->
        <a
          routerLink="/dashboard"
          routerLinkActive="bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
          [routerLinkActiveOptions]="{ exact: true }"
          (click)="closeSidebar.emit()"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white group"
        >
          <svg class="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>{{ 'NAV.DASHBOARD' | translate }}</span>
        </a>

        <!-- My Profile -->
        <a
          routerLink="/dashboard/profile"
          routerLinkActive="bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
          (click)="closeSidebar.emit()"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white group"
        >
          <svg class="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ 'NAV.PROFILE' | translate }}</span>
        </a>

        <!-- Preferences -->
        <a
          routerLink="/dashboard/preferences"
          routerLinkActive="bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
          (click)="closeSidebar.emit()"
          class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white group"
        >
          <svg class="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{{ 'NAV.PREFERENCES' | translate }}</span>
        </a>

        <!-- Admin Only: User Management -->
        @if (authService.isAdmin()) {
          <div class="pt-4 pb-1">
            <p class="px-3 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
              Administration
            </p>
          </div>

          <a
            routerLink="/admin/users"
            routerLinkActive="bg-sky-500 text-white shadow-md shadow-sky-500/20 font-semibold"
            (click)="closeSidebar.emit()"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white group"
          >
            <svg class="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>{{ 'NAV.ADMIN_USERS' | translate }}</span>
          </a>

          <!-- Admin Only: Sensor Management -->
          <a
            routerLink="/admin/sensors"
            routerLinkActive="bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold"
            (click)="closeSidebar.emit()"
            class="flex items-center space-x-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white group"
          >
            <svg class="w-5 h-5 text-slate-500 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{{ 'NAV.ADMIN_SENSORS' | translate }}</span>
          </a>
        }
      </nav>

      <!-- Footer Controls (Toggles & Logout) -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div class="flex items-center justify-between px-2">
          <app-theme-toggle></app-theme-toggle>
          <app-language-toggle></app-language-toggle>
        </div>

        <button
          (click)="onLogout()"
          type="button"
          class="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-medium text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>{{ 'NAV.LOGOUT' | translate }}</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  @Output() closeSidebar = new EventEmitter<void>();

  get userInitial(): string {
    const email = this.authService.getUserEmail();
    return email ? email.charAt(0).toUpperCase() : 'U';
  }

  onLogout(): void {
    this.closeSidebar.emit();
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: () => this.router.navigate(['/login'])
    });
  }
}
