import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AirQualityReading } from '../../../../models/air-quality.model';
import { AirQualityThresholdService, StoplightStatus } from '../../../../core/services/air-quality-threshold.service';

@Component({
  selector: 'app-report-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <!-- Header & Filter Controls -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ 'REPORTS.TABLE_TITLE' | translate }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ 'REPORTS.TABLE_SUBTITLE' | translate }} ({{ filteredReadings.length }} {{ 'REPORTS.READINGS_COUNT' | translate }})
          </p>
        </div>

        <!-- Severity Filter Buttons -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          <button
            (click)="selectedStatusFilter = 'ALL'; currentPage = 1"
            type="button"
            [class.bg-white]="selectedStatusFilter === 'ALL'"
            [class.dark:bg-slate-900]="selectedStatusFilter === 'ALL'"
            [class.text-sky-600]="selectedStatusFilter === 'ALL'"
            [class.dark:text-sky-400]="selectedStatusFilter === 'ALL'"
            [class.shadow-xs]="selectedStatusFilter === 'ALL'"
            class="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
          >
            {{ 'REPORTS.FILTER_ALL' | translate }}
          </button>
          <button
            (click)="selectedStatusFilter = 'green'; currentPage = 1"
            type="button"
            [class.bg-emerald-500]="selectedStatusFilter === 'green'"
            [class.text-white]="selectedStatusFilter === 'green'"
            [class.text-slate-600]="selectedStatusFilter !== 'green'"
            [class.dark:text-slate-300]="selectedStatusFilter !== 'green'"
            class="px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            🟢 {{ 'REPORTS.SEVERITY_GREEN' | translate }}
          </button>
          <button
            (click)="selectedStatusFilter = 'yellow'; currentPage = 1"
            type="button"
            [class.bg-amber-500]="selectedStatusFilter === 'yellow'"
            [class.text-white]="selectedStatusFilter === 'yellow'"
            [class.text-slate-600]="selectedStatusFilter !== 'yellow'"
            [class.dark:text-slate-300]="selectedStatusFilter !== 'yellow'"
            class="px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            🟡 {{ 'REPORTS.SEVERITY_YELLOW' | translate }}
          </button>
          <button
            (click)="selectedStatusFilter = 'orange'; currentPage = 1"
            type="button"
            [class.bg-orange-500]="selectedStatusFilter === 'orange'"
            [class.text-white]="selectedStatusFilter === 'orange'"
            [class.text-slate-600]="selectedStatusFilter !== 'orange'"
            [class.dark:text-slate-300]="selectedStatusFilter !== 'orange'"
            class="px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            🟠 {{ 'REPORTS.SEVERITY_ORANGE' | translate }}
          </button>
          <button
            (click)="selectedStatusFilter = 'red'; currentPage = 1"
            type="button"
            [class.bg-rose-500]="selectedStatusFilter === 'red'"
            [class.text-white]="selectedStatusFilter === 'red'"
            [class.text-slate-600]="selectedStatusFilter !== 'red'"
            [class.dark:text-slate-300]="selectedStatusFilter !== 'red'"
            class="px-2 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            🔴 {{ 'REPORTS.SEVERITY_RED' | translate }}
          </button>
        </div>
      </div>

      <!-- Table Wrapper -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="px-4 py-3">{{ 'REPORTS.TABLE_TIME' | translate }}</th>
              <th class="px-3 py-3">PM 2.5</th>
              <th class="px-3 py-3">PM 10</th>
              <th class="px-3 py-3">PM 1.0</th>
              <th class="px-3 py-3">CO₂</th>
              <th class="px-3 py-3">{{ 'REPORTS.TABLE_TEMP' | translate }}</th>
              <th class="px-3 py-3">{{ 'REPORTS.TABLE_HUMIDITY' | translate }}</th>
              <th class="px-4 py-3 text-right">{{ 'REPORTS.TABLE_STATUS' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80">
            @for (reading of paginatedReadings; track reading.time) {
              @let status = getReadingStatus(reading);
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td class="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {{ formatTime(reading.time) }}
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.pm2_5 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.pm10 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.pm1_0 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.co2 ?? '—' }} <span class="text-[10px] text-slate-400">ppm</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.temperature ?? '—' }} <span class="text-[10px] text-slate-400">°C</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ reading.humidity ?? '—' }} <span class="text-[10px] text-slate-400">%</span>
                </td>
                <td class="px-4 py-3 text-right">
                  <span
                    class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300': status === 'green',
                      'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300': status === 'yellow',
                      'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300': status === 'orange',
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300': status === 'red'
                    }"
                  >
                    {{ 'REPORTS.SEVERITY_' + status.toUpperCase() | translate }}
                  </span>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="8" class="text-center py-8 text-slate-400 dark:text-slate-500">
                  {{ 'REPORTS.NO_DATA' | translate }}
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination Controls -->
      @if (totalPages > 1) {
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2">
          <span>
            {{ 'REPORTS.PAGE' | translate }} {{ currentPage }} {{ 'REPORTS.OF' | translate }} {{ totalPages }}
          </span>
          <div class="flex items-center gap-1">
            <button
              (click)="goToPage(currentPage - 1)"
              [disabled]="currentPage <= 1"
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {{ 'REPORTS.PREV' | translate }}
            </button>
            <button
              (click)="goToPage(currentPage + 1)"
              [disabled]="currentPage >= totalPages"
              type="button"
              class="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {{ 'REPORTS.NEXT' | translate }}
            </button>
          </div>
        </div>
      }
    </div>
  `
})
export class ReportDataTableComponent {
  private thresholdService = inject(AirQualityThresholdService);

  @Input() readings: AirQualityReading[] = [];

  selectedStatusFilter: 'ALL' | StoplightStatus = 'ALL';
  currentPage = 1;
  pageSize = 10;

  get filteredReadings(): AirQualityReading[] {
    if (this.selectedStatusFilter === 'ALL') {
      return this.readings;
    }
    return this.readings.filter(r => this.thresholdService.getOverallStatus(r) === this.selectedStatusFilter);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredReadings.length / this.pageSize) || 1;
  }

  get paginatedReadings(): AirQualityReading[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredReadings.slice(startIndex, startIndex + this.pageSize);
  }

  getReadingStatus(reading: AirQualityReading): StoplightStatus {
    return this.thresholdService.getOverallStatus(reading);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  formatTime(isoString: string): string {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  }
}
