import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-login-prompt-modal',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
        <div (click)="$event.stopPropagation()" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
          <!-- Icon & Title -->
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ 'DASHBOARD.AUTH_PROMPT.TITLE' | translate }}
              </h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ 'DASHBOARD.AUTH_PROMPT.SUBTITLE' | translate }}
              </p>
            </div>
          </div>

          <!-- Description -->
          <p class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed" [innerHTML]="'DASHBOARD.AUTH_PROMPT.DESC' | translate">
          </p>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <a
              routerLink="/login"
              (click)="closeModal.emit()"
              class="w-full text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-sm"
            >
              {{ 'DASHBOARD.AUTH_PROMPT.LOGIN_BTN' | translate }}
            </a>
            <a
              routerLink="/register"
              (click)="closeModal.emit()"
              class="w-full text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {{ 'DASHBOARD.AUTH_PROMPT.REGISTER_BTN' | translate }}
            </a>
            <button
              (click)="closeModal.emit()"
              type="button"
              class="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {{ 'DASHBOARD.AUTH_PROMPT.CANCEL_BTN' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class LoginPromptModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
}
