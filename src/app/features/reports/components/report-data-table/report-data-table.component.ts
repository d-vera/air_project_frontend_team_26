import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { AirQualityReading } from '../../../../models/air-quality.model';
import { AirQualityThresholdService, StoplightStatus } from '../../../../core/services/air-quality-threshold.service';

export interface MergedReadingRow {
  reading: AirQualityReading;
  period: 'primary' | 'comparison';
  periodLabel: string;
}

@Component({
  selector: 'app-report-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <!-- Header & Filter Controls -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            {{ 'REPORTS.TABLE_TITLE' | translate }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ 'REPORTS.TABLE_SUBTITLE' | translate }} ({{ filteredRows.length }} {{ 'REPORTS.READINGS_COUNT' | translate }})
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Period Filter (Only shown when comparison data is present) -->
          @if (hasComparison) {
            <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
              <button
                (click)="selectedPeriodFilter = 'ALL'; currentPage = 1"
                type="button"
                [class.bg-white]="selectedPeriodFilter === 'ALL'"
                [class.dark:bg-slate-900]="selectedPeriodFilter === 'ALL'"
                [class.text-slate-900]="selectedPeriodFilter === 'ALL'"
                [class.dark:text-slate-100]="selectedPeriodFilter === 'ALL'"
                [class.shadow-xs]="selectedPeriodFilter === 'ALL'"
                class="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
              >
                {{ 'REPORTS.PERIOD_ALL' | translate }}
              </button>
              <button
                (click)="selectedPeriodFilter = 'primary'; currentPage = 1"
                type="button"
                [class.bg-sky-600]="selectedPeriodFilter === 'primary'"
                [class.text-white]="selectedPeriodFilter === 'primary'"
                [class.text-sky-700]="selectedPeriodFilter !== 'primary'"
                [class.dark:text-sky-400]="selectedPeriodFilter !== 'primary'"
                class="px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                {{ 'REPORTS.PERIOD_PRIMARY' | translate }}
              </button>
              <button
                (click)="selectedPeriodFilter = 'comparison'; currentPage = 1"
                type="button"
                [class.bg-violet-600]="selectedPeriodFilter === 'comparison'"
                [class.text-white]="selectedPeriodFilter === 'comparison'"
                [class.text-violet-700]="selectedPeriodFilter !== 'comparison'"
                [class.dark:text-violet-400]="selectedPeriodFilter !== 'comparison'"
                class="px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span class="w-2 h-2 rounded-full bg-violet-400"></span>
                {{ 'REPORTS.PERIOD_COMPARISON' | translate }}
              </button>
            </div>
          }

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
      </div>

      <!-- Table Wrapper -->
      <div class="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase font-bold border-b border-slate-200/80 dark:border-slate-800">
            <tr>
              <th class="px-4 py-3">{{ 'REPORTS.TABLE_TIME' | translate }}</th>
              @if (hasComparison) {
                <th class="px-3 py-3">{{ 'REPORTS.TABLE_PERIOD' | translate }}</th>
              }
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
            @for (row of paginatedRows; track row.reading.time + '-' + row.period) {
              @let status = getReadingStatus(row.reading);
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                <td class="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                  {{ formatTime(row.reading.time) }}
                </td>
                @if (hasComparison) {
                  <td class="px-3 py-3 whitespace-nowrap">
                    @if (row.period === 'primary') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                        <span class="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                        <span>{{ 'REPORTS.PERIOD_PRIMARY' | translate }}</span>
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                        <span class="w-2 h-2 rounded-full bg-violet-500 shrink-0"></span>
                        <span>{{ 'REPORTS.PERIOD_COMPARISON' | translate }}</span>
                      </span>
                    }
                  </td>
                }
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.pm2_5 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.pm10 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.pm1_0 ?? '—' }} <span class="text-[10px] text-slate-400">µg/m³</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.co2 ?? '—' }} <span class="text-[10px] text-slate-400">ppm</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.temperature ?? '—' }} <span class="text-[10px] text-slate-400">°C</span>
                </td>
                <td class="px-3 py-3 font-medium text-slate-700 dark:text-slate-300">
                  {{ row.reading.humidity ?? '—' }} <span class="text-[10px] text-slate-400">%</span>
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
                <td [attr.colspan]="hasComparison ? 9 : 8" class="text-center py-8 text-slate-400 dark:text-slate-500">
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
  @Input() primaryReadings: AirQualityReading[] = [];
  @Input() comparisonReadings: AirQualityReading[] = [];
  @Input() primaryLabel = '';
  @Input() comparisonLabel = '';

  selectedStatusFilter: 'ALL' | StoplightStatus = 'ALL';
  selectedPeriodFilter: 'ALL' | 'primary' | 'comparison' = 'ALL';
  currentPage = 1;
  pageSize = 10;

  get hasComparison(): boolean {
    return !!(this.comparisonReadings && this.comparisonReadings.length > 0);
  }

  get allMergedRows(): MergedReadingRow[] {
    const prim = (this.primaryReadings && this.primaryReadings.length > 0)
      ? this.primaryReadings
      : this.readings;
    const comp = this.comparisonReadings || [];

    const primLabel = this.primaryLabel || 'Primary';
    const compLabel = this.comparisonLabel || 'Comparison';

    const rows: MergedReadingRow[] = [];
    if (prim) {
      for (const r of prim) {
        rows.push({ reading: r, period: 'primary', periodLabel: primLabel });
      }
    }
    for (const r of comp) {
      rows.push({ reading: r, period: 'comparison', periodLabel: compLabel });
    }

    return rows.sort((a, b) => new Date(a.reading.time).getTime() - new Date(b.reading.time).getTime());
  }

  get filteredRows(): MergedReadingRow[] {
    return this.allMergedRows.filter(row => {
      if (this.selectedPeriodFilter !== 'ALL' && row.period !== this.selectedPeriodFilter) {
        return false;
      }
      if (this.selectedStatusFilter !== 'ALL') {
        if (this.thresholdService.getOverallStatus(row.reading) !== this.selectedStatusFilter) {
          return false;
        }
      }
      return true;
    });
  }

  get filteredReadings(): AirQualityReading[] {
    return this.filteredRows.map(r => r.reading);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredRows.length / this.pageSize) || 1;
  }

  get paginatedRows(): MergedReadingRow[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredRows.slice(startIndex, startIndex + this.pageSize);
  }

  get paginatedReadings(): AirQualityReading[] {
    return this.paginatedRows.map(r => r.reading);
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

