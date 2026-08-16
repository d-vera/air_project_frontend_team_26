import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { AirQualityService } from '../../core/services/air-quality.service';
import { User } from '../../models/user.model';
import {
  AirQualityReading,
  TimeRangeShortcut,
  CustomDateRange
} from '../../models/air-quality.model';
import { RealTimeCardsComponent } from './components/real-time-cards/real-time-cards.component';
import { HistoricalChartComponent } from './components/historical-chart/historical-chart.component';
import { LoginPromptModalComponent } from '../../shared/components/login-prompt-modal/login-prompt-modal.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslatePipe,
    RealTimeCardsComponent,
    HistoricalChartComponent,
    LoginPromptModalComponent
  ],
  template: `
    <div class="space-y-8">
      <!-- Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 text-white p-6 sm:p-8 shadow-xl shadow-sky-500/20">
        <div class="relative z-10">
          <span class="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            {{ 'DASHBOARD.SYSTEM_TITLE' | translate }}
          </span>
          <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight">
            @if (authService.isAuthenticated()) {
              {{ 'DASHBOARD.WELCOME' | translate:{ name: user()?.firstName || authService.getUserEmail() } }}
            } @else {
              {{ 'DASHBOARD.ANONYMOUS_TITLE' | translate }}
            }
          </h1>
          <p class="mt-2 text-sky-100 text-sm sm:text-base max-w-2xl">
            @if (authService.isAuthenticated()) {
              {{ 'DASHBOARD.ROLE_INFO' | translate:{ role: (authService.isAdmin() ? 'ADMIN.ROLE_ADMIN' : 'ADMIN.ROLE_REGISTERED_USER') | translate } }}
            } @else {
              {{ 'DASHBOARD.ANONYMOUS_SUBTITLE' | translate }}
            }
          </p>
        </div>

        <!-- Decorative background circles -->
        <div class="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      </div>

      <!-- Real-Time Air Quality Section -->
      <app-real-time-cards
        [readings]="currentReadings()"
        [deviceList]="deviceList()"
        [selectedDeviceId]="selectedDeviceId()"
        (selectedDeviceIdChange)="onDeviceChange($event)"
      ></app-real-time-cards>

      <!-- Historical Data Trends Section -->
      <app-historical-chart
        [readings]="historicalReadings()"
        [activeShortcut]="activeShortcut()"
        (shortcutChange)="onShortcutChange($event)"
        (customRangeChange)="onCustomRangeChange($event)"
        (triggerAuthPrompt)="showAuthModal.set(true)"
      ></app-historical-chart>

      <!-- Quick Action Cards Grid (Profile & Admin) -->
      @if (authService.isAuthenticated()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <!-- Profile Card -->
          <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
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
            <div class="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
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
      }

      <!-- Login Prompt Modal for Visitors -->
      <app-login-prompt-modal
        [isOpen]="showAuthModal()"
        (closeModal)="showAuthModal.set(false)"
      ></app-login-prompt-modal>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private userService = inject(UserService);
  private airQualityService = inject(AirQualityService);
  authService = inject(AuthService);

  user = signal<User | null>(null);

  currentReadings = signal<AirQualityReading[]>([]);
  historicalReadings = signal<AirQualityReading[]>([]);
  deviceList = signal<string[]>([]);
  selectedDeviceId = signal<string>('');
  activeShortcut = signal<TimeRangeShortcut>('24h');
  showAuthModal = signal<boolean>(false);

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.userService.getMe().subscribe({
        next: (userData) => this.user.set(userData),
        error: () => {}
      });
    }

    this.loadCurrentData();
    this.loadHistoricalData();
  }

  loadCurrentData(): void {
    this.airQualityService.getCurrentReadings(this.selectedDeviceId()).subscribe({
      next: (res) => {
        if (res && res.readings && res.readings.length > 0) {
          this.currentReadings.set(res.readings);
          const devices = Array.from(new Set(res.readings.map(r => r.deviceId)));
          this.deviceList.set(devices);
        } else {
          this.setFallbackCurrentData();
        }
      },
      error: () => {
        this.setFallbackCurrentData();
      }
    });
  }

  loadHistoricalData(): void {
    this.airQualityService.getHistoricalReadings({
      deviceId: this.selectedDeviceId(),
      rangeShortcut: this.activeShortcut()
    }).subscribe({
      next: (res) => {
        if (res && res.readings && res.readings.length > 0) {
          this.historicalReadings.set(res.readings);
        } else {
          this.setFallbackHistoricalData();
        }
      },
      error: () => {
        this.setFallbackHistoricalData();
      }
    });
  }

  onDeviceChange(deviceId: string): void {
    this.selectedDeviceId.set(deviceId);
    this.loadCurrentData();
    this.loadHistoricalData();
  }

  onShortcutChange(shortcut: TimeRangeShortcut): void {
    this.activeShortcut.set(shortcut);
    this.loadHistoricalData();
  }

  onCustomRangeChange(range: CustomDateRange): void {
    this.activeShortcut.set('custom');
    this.airQualityService.getHistoricalReadings({
      deviceId: this.selectedDeviceId(),
      from: range.from,
      to: range.to
    }).subscribe({
      next: (res) => {
        if (res && res.readings && res.readings.length > 0) {
          this.historicalReadings.set(res.readings);
        } else {
          this.setFallbackHistoricalData();
        }
      },
      error: () => {
        this.setFallbackHistoricalData();
      }
    });
  }

  private setFallbackCurrentData(): void {
    const fallback: AirQualityReading[] = [
      {
        deviceId: 'ESP32_001',
        deviceName: 'Nodo Principal',
        time: new Date().toISOString(),
        temperature: 24.8,
        humidity: 61.5,
        co2: 405.2,
        pm1_0: 7.9,
        pm2_5: 14.3,
        pm10: 21.1
      }
    ];
    this.currentReadings.set(fallback);
    this.deviceList.set(['ESP32_001', 'ESP32_002']);
  }

  private setFallbackHistoricalData(): void {
    const now = Date.now();
    const fallback: AirQualityReading[] = [];
    const shortcut = this.activeShortcut();

    let intervalMs = 60 * 60 * 1000; // 1 hour (24h)
    let count = 24;

    if (shortcut === '24h') {
      intervalMs = 60 * 60 * 1000; // 1h intervals for 24h
      count = 24;
    } else if (shortcut === '7d') {
      intervalMs = 6 * 3600 * 1000; // 6h intervals across 7d
      count = 28;
    } else if (shortcut === '30d') {
      intervalMs = 24 * 3600 * 1000; // 1 day intervals across 30d
      count = 30;
    } else if (shortcut === '1y') {
      intervalMs = 14 * 24 * 3600 * 1000; // 2 week intervals across 1 year
      count = 26;
    } else if (shortcut === 'custom') {
      intervalMs = 24 * 3600 * 1000;
      count = 15;
    }

    for (let i = count - 1; i >= 0; i--) {
      const timeMs = now - i * intervalMs;
      fallback.push({
        deviceId: this.selectedDeviceId() || 'ESP32_001',
        deviceName: 'Nodo Principal',
        time: new Date(timeMs).toISOString(),
        temperature: parseFloat((22 + Math.sin(i * 0.5) * 4).toFixed(1)),
        humidity: parseFloat((55 + Math.cos(i * 0.5) * 10).toFixed(1)),
        co2: parseFloat((400 + Math.sin(i * 0.4) * 45).toFixed(1)),
        pm1_0: parseFloat((6 + Math.cos(i * 0.5) * 2.5).toFixed(1)),
        pm2_5: parseFloat((12 + Math.sin(i * 0.6) * 5).toFixed(1)),
        pm10: parseFloat((18 + Math.cos(i * 0.4) * 7).toFixed(1))
      });
    }
    this.historicalReadings.set(fallback);
  }
}
