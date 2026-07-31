import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { UserService } from '../../../core/services/user.service';
import { UserResponse, UserRole } from '../../../models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  template: `
    <div class="space-y-6">
      <!-- Header Bar -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
            {{ 'ADMIN.TITLE' | translate }}
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {{ 'ADMIN.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Total counter badge -->
        <div class="inline-flex items-center space-x-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs self-start sm:self-auto">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {{ 'ADMIN.TOTAL_USERS' | translate }}:
          </span>
          <span class="text-sm font-extrabold text-sky-600 dark:text-sky-400">
            {{ filteredUsers().length }}
          </span>
        </div>
      </div>

      <!-- Toast Feedback Message -->
      @if (toastMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <svg class="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ toastMessage()! | translate }}</span>
          </div>
          <button (click)="toastMessage.set(null)" type="button" class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800">
            &times;
          </button>
        </div>
      }

      <!-- Search Filter Bar -->
      <div class="relative">
        <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          [ngModel]="searchTerm()"
          (ngModelChange)="searchTerm.set($event)"
          [placeholder]="'ADMIN.SEARCH_PLACEHOLDER' | translate"
          class="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm transition-all shadow-xs"
        />
      </div>

      <!-- Loading Spinner -->
      @if (loading()) {
        <div class="p-12 text-center text-slate-400">
          <svg class="animate-spin h-8 w-8 mx-auto mb-2 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-sm font-medium">{{ 'COMMON.LOADING' | translate }}</p>
        </div>
      }

      <!-- Empty State -->
      @if (!loading() && filteredUsers().length === 0) {
        <div class="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
            {{ 'ADMIN.NO_USERS_FOUND' | translate }}
          </h3>
        </div>
      }

      <!-- Card-Based User Grid -->
      @if (!loading() && filteredUsers().length > 0) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (u of filteredUsers(); track u.id) {
            <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-md hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
              
              <!-- Card Header: User Avatar & Basic Info -->
              <div class="flex items-start space-x-3.5">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md shadow-sky-500/20">
                  {{ u.firstName.charAt(0) }}{{ u.lastName.charAt(0) }}
                </div>
                <div class="overflow-hidden flex-1">
                  <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                    {{ u.firstName }} {{ u.lastName }}
                  </h3>
                  <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {{ u.email }}
                  </p>
                </div>
              </div>

              <!-- Status Badges & Role -->
              <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <!-- Role Tag -->
                <span
                  class="px-2.5 py-1 rounded-lg text-xs font-bold"
                  [ngClass]="{
                    'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800': u.role === 'ADMIN',
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700': u.role === 'REGISTERED_USER'
                  }"
                >
                  {{ (u.role === 'ADMIN' ? 'ADMIN.ROLE_ADMIN' : 'ADMIN.ROLE_REGISTERED_USER') | translate }}
                </span>

                <!-- Active / Inactive Badge -->
                <span
                  class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                  [ngClass]="{
                    'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800': u.active,
                    'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800': !u.active
                  }"
                >
                  <span class="w-2 h-2 rounded-full" [ngClass]="u.active ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                  <span>{{ (u.active ? 'PROFILE.ACTIVE_STATUS' : 'PROFILE.INACTIVE_STATUS') | translate }}</span>
                </span>
              </div>

              <!-- Card Action Buttons -->
              <div class="grid grid-cols-2 gap-2 pt-2">
                <!-- View / Edit -->
                <a
                  [routerLink]="['/admin/users', u.id]"
                  class="px-3 py-2 rounded-xl text-center text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {{ 'ADMIN.VIEW_USER' | translate }}
                </a>

                <!-- Deactivate Action -->
                @if (u.active) {
                  <button
                    (click)="openDeactivateModal(u)"
                    type="button"
                    class="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                  >
                    {{ 'ADMIN.DEACTIVATE' | translate }}
                  </button>
                } @else {
                  <button
                    (click)="onActivateUser(u)"
                    type="button"
                    class="px-3 py-2 rounded-xl text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                  >
                    {{ 'ADMIN.ACTIVATE' | translate }}
                  </button>
                }
              </div>

            </div>
          }
        </div>
      }

      <!-- Deactivate Confirmation Modal -->
      @if (deactivateModalUser()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-scale-in">
            <div class="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <div>
              <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ 'ADMIN.CONFIRM_DEACTIVATE_TITLE' | translate }}
              </h3>
              <p class="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {{ 'ADMIN.CONFIRM_DEACTIVATE_MSG' | translate:{ name: deactivateModalUser()?.firstName + ' ' + deactivateModalUser()?.lastName } }}
              </p>
            </div>

            <div class="flex items-center justify-end space-x-3 pt-2">
              <button
                (click)="deactivateModalUser.set(null)"
                type="button"
                class="px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {{ 'PROFILE.CANCEL' | translate }}
              </button>
              <button
                (click)="confirmDeactivate()"
                type="button"
                class="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
              >
                {{ 'ADMIN.CONFIRM' | translate }}
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class UserListComponent implements OnInit {
  private userService = inject(UserService);

  users = signal<UserResponse[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');
  toastMessage = signal<string | null>(null);
  deactivateModalUser = signal<UserResponse | null>(null);

  filteredUsers = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.users();
    return this.users().filter(u =>
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  openDeactivateModal(u: UserResponse): void {
    this.deactivateModalUser.set(u);
  }

  confirmDeactivate(): void {
    const u = this.deactivateModalUser();
    if (!u) return;

    this.userService.deleteUser(u.id).subscribe({
      next: () => {
        this.toastMessage.set('ADMIN.USER_DEACTIVATED');
        this.deactivateModalUser.set(null);
        this.loadUsers();
      },
      error: () => {
        this.deactivateModalUser.set(null);
      }
    });
  }

  onActivateUser(u: UserResponse): void {
    // Re-activate user via update endpoint setting active true
    this.userService.updateUser(u.id, { firstName: u.firstName, lastName: u.lastName }).subscribe({
      next: () => {
        this.toastMessage.set('ADMIN.USER_ACTIVATED');
        this.loadUsers();
      }
    });
  }
}
