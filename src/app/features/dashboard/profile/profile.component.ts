import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../../core/services/user.service';
import { UserResponse } from '../../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {{ 'PROFILE.TITLE' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ 'PROFILE.SUBTITLE' | translate }}
          </p>
        </div>

        @if (!isEditing()) {
          <button
            (click)="enableEdit()"
            type="button"
            class="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-md shadow-sky-500/20 flex items-center space-x-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{{ 'PROFILE.EDIT_PROFILE' | translate }}</span>
          </button>
        }
      </div>

      <!-- Success / Error Alerts -->
      @if (successMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center space-x-2">
          <svg class="w-5 h-5 shrink-0 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ successMessage()! | translate }}</span>
        </div>
      }

      @if (errorMessage()) {
        <div class="p-4 rounded-2xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 text-sm flex items-center space-x-2">
          <svg class="w-5 h-5 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage()! | translate }}</span>
        </div>
      }

      @if (loading() && !user()) {
        <div class="p-12 text-center text-slate-400">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-medium">{{ 'COMMON.LOADING' | translate }}</p>
        </div>
      }

      @if (user()) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
          @if (!isEditing()) {
            <!-- Profile View Mode -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- First Name -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'AUTH.FIRST_NAME' | translate }}
                </p>
                <p class="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  {{ user()?.firstName }}
                </p>
              </div>

              <!-- Last Name -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'AUTH.LAST_NAME' | translate }}
                </p>
                <p class="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  {{ user()?.lastName }}
                </p>
              </div>

              <!-- Email -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'AUTH.EMAIL' | translate }}
                </p>
                <p class="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  {{ user()?.email }}
                </p>
              </div>

              <!-- Role -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'PROFILE.ROLE' | translate }}
                </p>
                <p class="mt-1 text-base font-bold text-sky-600 dark:text-sky-400">
                  {{ (user()?.role === 'ADMIN' ? 'ADMIN.ROLE_ADMIN' : 'ADMIN.ROLE_REGISTERED_USER') | translate }}
                </p>
              </div>

              <!-- Active Status -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'PROFILE.ACTIVE' | translate }}
                </p>
                <div class="mt-1 flex items-center space-x-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span class="text-base font-bold text-emerald-600 dark:text-emerald-400">
                    {{ 'PROFILE.ACTIVE_STATUS' | translate }}
                  </span>
                </div>
              </div>

              <!-- Joined Date -->
              <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {{ 'PROFILE.CREATED_AT' | translate }}
                </p>
                <p class="mt-1 text-base font-bold text-slate-900 dark:text-slate-100">
                  {{ user()?.createdAt | date:'mediumDate' }}
                </p>
              </div>
            </div>
          } @else {
            <!-- Profile Edit Mode -->
            <form (ngSubmit)="onSave()" #editForm="ngForm" class="space-y-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label for="firstName" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    {{ 'AUTH.FIRST_NAME' | translate }}
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    [(ngModel)]="editFirstName"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>

                <div>
                  <label for="lastName" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    {{ 'AUTH.LAST_NAME' | translate }}
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    [(ngModel)]="editLastName"
                    required
                    class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                  />
                </div>
              </div>

              <!-- Password Update (Optional) -->
              <div>
                <label for="password" class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                  {{ 'AUTH.PASSWORD' | translate }}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  [(ngModel)]="editPassword"
                  minlength="8"
                  #passInput="ngModel"
                  [placeholder]="'PROFILE.NEW_PASSWORD_HINT' | translate"
                  class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                />
                @if (passInput.touched && passInput.errors?.['minlength']) {
                  <p class="mt-1 text-xs text-red-500">
                    {{ 'AUTH.PASSWORD_MIN_LENGTH' | translate }}
                  </p>
                }
              </div>

              <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  (click)="cancelEdit()"
                  type="button"
                  class="px-5 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {{ 'PROFILE.CANCEL' | translate }}
                </button>
                <button
                  type="submit"
                  [disabled]="editForm.invalid || saving()"
                  class="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-sky-500 hover:bg-sky-600 disabled:opacity-50 transition-colors shadow-md shadow-sky-500/20"
                >
                  @if (saving()) {
                    <span>{{ 'COMMON.LOADING' | translate }}</span>
                  } @else {
                    <span>{{ 'PROFILE.SAVE_CHANGES' | translate }}</span>
                  }
                </button>
              </div>
            </form>
          }
        </div>
      }
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private userService = inject(UserService);

  user = signal<UserResponse | null>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  isEditing = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  editFirstName = '';
  editLastName = '';
  editPassword = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.userService.getMe().subscribe({
      next: (data) => {
        this.user.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.errorMessage.set('PROFILE.UPDATE_ERROR');
      }
    });
  }

  enableEdit(): void {
    if (!this.user()) return;
    this.editFirstName = this.user()!.firstName;
    this.editLastName = this.user()!.lastName;
    this.editPassword = '';
    this.isEditing.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  cancelEdit(): void {
    this.isEditing.set(false);
  }

  onSave(): void {
    if (!this.editFirstName || !this.editLastName) return;

    this.saving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const payload: { firstName: string; lastName: string; password?: string } = {
      firstName: this.editFirstName,
      lastName: this.editLastName
    };

    if (this.editPassword && this.editPassword.trim().length >= 8) {
      payload.password = this.editPassword;
    }

    this.userService.updateMe(payload).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.saving.set(false);
        this.isEditing.set(false);
        this.successMessage.set('PROFILE.UPDATE_SUCCESS');
      },
      error: () => {
        this.saving.set(false);
        this.errorMessage.set('PROFILE.UPDATE_ERROR');
      }
    });
  }
}
