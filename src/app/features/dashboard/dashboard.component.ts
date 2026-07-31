import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white p-6 sm:p-8 shadow-xl shadow-sky-500/20">
        <div class="relative z-10">
          <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            Air Project Dashboard
          </span>
          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {{ 'DASHBOARD.WELCOME' | translate:{ name: user()?.firstName || authService.getUserEmail() } }}
          </h1>
          <p class="mt-2 text-sky-100 text-sm sm:text-base max-w-2xl">
            {{ 'DASHBOARD.ROLE_INFO' | translate:{ role: (authService.isAdmin() ? 'ADMIN.ROLE_ADMIN' : 'ADMIN.ROLE_REGISTERED_USER') | translate } }}
          </p>
        </div>

        <!-- Decorative background circles -->
        <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      <!-- Quick Action Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Profile Card -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div>
            <div class="w-12 h-12 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {{ 'PROFILE.TITLE' | translate }}
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {{ 'PROFILE.SUBTITLE' | translate }}
            </p>
          </div>

          <a
            routerLink="/dashboard/profile"
            class="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors"
          >
            <span>{{ 'DASHBOARD.VIEW_PROFILE' | translate }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <!-- Admin Management Card (If Admin) -->
        @if (authService.isAdmin()) {
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div class="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ 'ADMIN.TITLE' | translate }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {{ 'ADMIN.SUBTITLE' | translate }}
              </p>
            </div>

            <a
              routerLink="/admin/users"
              class="mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-semibold text-xs text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 transition-colors"
            >
              <span>{{ 'DASHBOARD.MANAGE_USERS' | translate }}</span>
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        }
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  authService = inject(AuthService);

  user = signal<User | null>(null);

  ngOnInit(): void {
    this.userService.getMe().subscribe({
      next: (userData) => this.user.set(userData),
      error: () => {}
    });
  }
}
