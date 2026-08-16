import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle/language-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslatePipe,
    ThemeToggleComponent,
    LanguageToggleComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col justify-center bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 transition-colors">
      <!-- Top header bar with controls -->
      <div class="absolute top-4 right-4 flex items-center space-x-2">
        <app-language-toggle></app-language-toggle>
        <app-theme-toggle></app-theme-toggle>
      </div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <!-- Logo Icon -->
        <div class="relative flex justify-center items-center">
          <div class="absolute inset-0 bg-gradient-to-tr from-sky-500/30 to-indigo-500/30 rounded-full blur-xl transform scale-110"></div>
          <img
            src="assets/images/logo.jpg"
            alt="Project Aeolus Logo"
            class="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full object-cover shadow-2xl border-2 border-slate-700/50 dark:border-slate-700"
          />
        </div>

        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          {{ 'AUTH.LOGIN_TITLE' | translate }}
        </h2>
        <p class="mt-2 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          {{ 'AUTH.LOGIN_SUBTITLE' | translate }}
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white dark:bg-slate-900 py-8 px-6 sm:px-10 shadow-xl shadow-slate-200/50 dark:shadow-none rounded-2xl border border-slate-200/80 dark:border-slate-800">
          
          <!-- Session Expired Notification -->
          @if (sessionExpired()) {
            <div class="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
              {{ 'AUTH.SESSION_EXPIRED' | translate }}
            </div>
          }

          <!-- Error Alert -->
          @if (errorMessage()) {
            <div class="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center space-x-2">
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ errorMessage()! | translate }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" #loginForm="ngForm" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="email" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {{ 'AUTH.EMAIL' | translate }}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                [(ngModel)]="email"
                required
                email
                #emailInput="ngModel"
                [placeholder]="'AUTH.EMAIL' | translate"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                {{ 'AUTH.PASSWORD' | translate }}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                [(ngModel)]="password"
                required
                #passwordInput="ngModel"
                [placeholder]="'AUTH.PASSWORD' | translate"
                class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400 focus:bg-white dark:focus:bg-slate-800 transition-all text-sm"
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              [disabled]="loginForm.invalid || loading()"
              class="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-500/25 transition-all transform active:scale-[0.99] text-sm flex items-center justify-center space-x-2"
            >
              @if (loading()) {
                <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ 'COMMON.LOADING' | translate }}</span>
              } @else {
                <span>{{ 'AUTH.LOGIN_BTN' | translate }}</span>
              }
            </button>
          </form>

          <!-- Register Link -->
          <div class="mt-6 text-center border-t border-slate-200 dark:border-slate-800 pt-5">
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {{ 'AUTH.NO_ACCOUNT' | translate }}
              <a
                routerLink="/register"
                class="font-semibold text-sky-600 dark:text-sky-400 hover:underline ml-1"
              >
                {{ 'AUTH.REGISTER_LINK' | translate }}
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  email = '';
  password = '';
  loading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  sessionExpired = signal<boolean>(false);

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['expired']) {
        this.sessionExpired.set(true);
      }
    });
  }

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.errorMessage.set('AUTH.INVALID_CREDENTIALS');
        } else {
          this.errorMessage.set('COMMON.ERROR');
        }
      }
    });
  }
}
