import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { UserService } from '../../../core/services/user.service';
import { UserResponse, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Back Navigation Bar -->
      <div>
        <a
          routerLink="/admin/users"
          class="inline-flex items-center space-x-2 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline mb-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span>{{ 'ADMIN.BACK_TO_USERS' | translate }}</span>
        </a>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          {{ 'ADMIN.USER_DETAILS' | translate }}
        </h1>
      </div>

      <!-- Toast Feedback Message -->
      @if (toastMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center space-x-2">
          <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{{ toastMessage()! | translate }}</span>
        </div>
      }

      @if (loading()) {
        <div class="p-12 text-center text-slate-400">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-medium">{{ 'COMMON.LOADING' | translate }}</p>
        </div>
      }

      @if (user()) {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Left Column: User Profile Card & Actions -->
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <div class="text-center">
              <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-extrabold text-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-sky-500/25">
                {{ user()?.firstName?.charAt(0) }}{{ user()?.lastName?.charAt(0) }}
              </div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ user()?.firstName }} {{ user()?.lastName }}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                {{ user()?.email }}
              </p>
            </div>

            <!-- Role Selector -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {{ 'ADMIN.ASSIGN_ROLE_TITLE' | translate }}
              </label>
              <select
                [ngModel]="selectedRole()"
                (ngModelChange)="onRoleChange($event)"
                class="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="REGISTERED_USER">{{ 'ADMIN.ROLE_REGISTERED_USER' | translate }}</option>
                <option value="ADMIN">{{ 'ADMIN.ROLE_ADMIN' | translate }}</option>
              </select>
            </div>

            <!-- Metadata Info -->
            <div class="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-500">
              <div class="flex justify-between">
                <span>{{ 'PROFILE.ID' | translate }}:</span>
                <span class="font-bold text-slate-700 dark:text-slate-300">#{{ user()?.id }}</span>
              </div>
              <div class="flex justify-between">
                <span>{{ 'PROFILE.CREATED_AT' | translate }}:</span>
                <span class="font-semibold text-slate-700 dark:text-slate-300">{{ user()?.createdAt | date:'shortDate' }}</span>
              </div>
            </div>
          </div>

          <!-- Right Column: Edit Profile Form -->
          <div class="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md space-y-6">
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-3">
              {{ 'ADMIN.EDIT_USER' | translate }}
            </h3>

            <form (ngSubmit)="onSaveUser()" #userForm="ngForm" class="space-y-4">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div class="pt-4 flex justify-end">
                <button
                  type="submit"
                  [disabled]="userForm.invalid || saving()"
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
          </div>
        </div>
      }
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);

  user = signal<UserResponse | null>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  selectedRole = signal<UserRole>('REGISTERED_USER');
  toastMessage = signal<string | null>(null);

  editFirstName = '';
  editLastName = '';
  editPassword = '';

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: number): void {
    this.loading.set(true);
    this.userService.getUserById(id).subscribe({
      next: (data) => {
        this.user.set(data);
        this.selectedRole.set(data.role);
        this.editFirstName = data.firstName;
        this.editLastName = data.lastName;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.router.navigate(['/admin/users']);
      }
    });
  }

  onRoleChange(newRole: UserRole): void {
    const u = this.user();
    if (!u || u.role === newRole) return;

    this.userService.assignRole(u.id, { role: newRole }).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.selectedRole.set(updated.role);
        this.toastMessage.set('ADMIN.ROLE_UPDATED');
      }
    });
  }

  onSaveUser(): void {
    const u = this.user();
    if (!u || !this.editFirstName || !this.editLastName) return;

    this.saving.set(true);
    const payload: { firstName: string; lastName: string; password?: string } = {
      firstName: this.editFirstName,
      lastName: this.editLastName
    };

    if (this.editPassword && this.editPassword.trim().length >= 8) {
      payload.password = this.editPassword;
    }

    this.userService.updateUser(u.id, payload).subscribe({
      next: (updated) => {
        this.user.set(updated);
        this.saving.set(false);
        this.toastMessage.set('PROFILE.UPDATE_SUCCESS');
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }
}
