import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Sensor } from '../../../../models/sensor.model';
import { TimeRangeShortcut } from '../../../../models/air-quality.model';

@Component({
  selector: 'app-report-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {{ 'REPORTS.CONFIGURATION_TITLE' | translate }}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ 'REPORTS.CONFIGURATION_SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Generate Action Button -->
        <button
          (click)="onGenerate()"
          [disabled]="loading || !selectedSensorUid"
          type="button"
          class="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-sky-600/20 transition-all cursor-pointer shrink-0"
        >
          @if (loading) {
            <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            <span>{{ 'REPORTS.LOADING' | translate }}</span>
          } @else {
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ 'REPORTS.GENERATE_BUTTON' | translate }}</span>
          }
        </button>
      </div>

      <!-- Controls Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- 1. Station Selector -->
        <div>
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            {{ 'REPORTS.SELECT_STATION' | translate }}
          </label>
          <div class="relative">
            <select
              [ngModel]="selectedSensorUid"
              (ngModelChange)="onSensorChange($event)"
              class="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              @if (!sensors || sensors.length === 0) {
                <option value="" disabled selected>
                  {{ 'REPORTS.LOADING' | translate }}
                </option>
              }
              @for (sensor of sensors; track sensor.id) {
                <option [value]="sensor.uidSensor">
                  {{ sensor.name }} ({{ sensor.uidSensor }})
                </option>
              }
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 2. Primary Time Period -->
        <div class="space-y-2">
          <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {{ 'REPORTS.PRIMARY_PERIOD' | translate }}
          </label>
          <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
            @for (shortcut of shortcuts; track shortcut) {
              <button
                (click)="onShortcutSelect(shortcut)"
                type="button"
                [class.bg-white]="selectedShortcut === shortcut"
                [class.dark:bg-slate-900]="selectedShortcut === shortcut"
                [class.text-sky-600]="selectedShortcut === shortcut"
                [class.dark:text-sky-400]="selectedShortcut === shortcut"
                [class.shadow-xs]="selectedShortcut === shortcut"
                class="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
              >
                {{ getShortcutTranslationKey(shortcut) | translate }}
              </button>
            }
          </div>

          <!-- Custom range dates if selected -->
          @if (selectedShortcut === 'custom') {
            <div class="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label class="block text-[11px] text-slate-500 dark:text-slate-400">{{ 'REPORTS.FROM' | translate }}</label>
                <input
                  type="date"
                  [ngModel]="customFrom"
                  (ngModelChange)="onFromChange($event)"
                  class="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
              <div>
                <label class="block text-[11px] text-slate-500 dark:text-slate-400">{{ 'REPORTS.TO' | translate }}</label>
                <input
                  type="date"
                  [ngModel]="customTo"
                  (ngModelChange)="onToChange($event)"
                  class="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                />
              </div>
            </div>
          }
        </div>

        <!-- 3. Comparison Mode Toggle -->
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {{ 'REPORTS.COMPARE_PERIODS' | translate }}
            </label>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [checked]="comparisonEnabled"
                (change)="onToggleComparison($event)"
                class="sr-only peer"
              />
              <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-violet-600"></div>
            </label>
          </div>

          @if (comparisonEnabled) {
            <div class="p-3 bg-violet-50/60 dark:bg-violet-950/20 border border-violet-200/60 dark:border-violet-900/40 rounded-2xl space-y-2 animate-fade-in">
              <p class="text-[11px] font-semibold text-violet-700 dark:text-violet-300">
                {{ 'REPORTS.COMPARE_DESCRIPTION' | translate }}
              </p>
              <div class="flex flex-wrap items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 p-1 rounded-xl">
                @for (shortcut of comparisonShortcuts; track shortcut) {
                  <button
                    (click)="onComparisonShortcutSelect(shortcut)"
                    type="button"
                    [class.bg-violet-600]="comparisonShortcut === shortcut"
                    [class.text-white]="comparisonShortcut === shortcut"
                    [class.text-slate-600]="comparisonShortcut !== shortcut"
                    [class.dark:text-slate-300]="comparisonShortcut !== shortcut"
                    class="px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  >
                    {{ getShortcutTranslationKey(shortcut) | translate }}
                  </button>
                }
              </div>

              @if (comparisonShortcut === 'custom') {
                <div class="grid grid-cols-2 gap-2 pt-1">
                  <input
                    type="date"
                    [ngModel]="comparisonCustomFrom"
                    (ngModelChange)="onComparisonFromChange($event)"
                    class="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                  <input
                    type="date"
                    [ngModel]="comparisonCustomTo"
                    (ngModelChange)="onComparisonToChange($event)"
                    class="w-full px-2 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200"
                  />
                </div>
              }
            </div>
          } @else {
            <p class="text-xs text-slate-400 dark:text-slate-500 pt-1">
              {{ 'REPORTS.COMPARE_DISABLED_NOTE' | translate }}
            </p>
          }
        </div>
      </div>
    </div>
  `
})
export class ReportFilterBarComponent {
  @Input() sensors: Sensor[] = [];
  @Input() selectedSensorUid = '';
  @Input() selectedShortcut: TimeRangeShortcut = '30d';
  @Input() customFrom = '';
  @Input() customTo = '';
  @Input() comparisonEnabled = false;
  @Input() comparisonShortcut: TimeRangeShortcut = '30d';
  @Input() comparisonCustomFrom = '';
  @Input() comparisonCustomTo = '';
  @Input() loading = false;

  @Output() sensorChange = new EventEmitter<string>();
  @Output() shortcutChange = new EventEmitter<TimeRangeShortcut>();
  @Output() customFromChange = new EventEmitter<string>();
  @Output() customToChange = new EventEmitter<string>();
  @Output() comparisonToggle = new EventEmitter<boolean>();
  @Output() comparisonShortcutChange = new EventEmitter<TimeRangeShortcut>();
  @Output() comparisonCustomFromChange = new EventEmitter<string>();
  @Output() comparisonCustomToChange = new EventEmitter<string>();
  @Output() generateReport = new EventEmitter<void>();

  readonly shortcuts: TimeRangeShortcut[] = ['24h', '7d', '30d', '1y', 'custom'];
  readonly comparisonShortcuts: TimeRangeShortcut[] = ['24h', '7d', '30d', '1y', 'custom'];

  onSensorChange(uid: string): void {
    this.sensorChange.emit(uid);
  }

  onShortcutSelect(shortcut: TimeRangeShortcut): void {
    this.shortcutChange.emit(shortcut);
  }

  onFromChange(val: string): void {
    this.customFromChange.emit(val);
  }

  onToChange(val: string): void {
    this.customToChange.emit(val);
  }

  onToggleComparison(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.comparisonToggle.emit(checked);
  }

  onComparisonShortcutSelect(shortcut: TimeRangeShortcut): void {
    this.comparisonShortcutChange.emit(shortcut);
  }

  onComparisonFromChange(val: string): void {
    this.comparisonCustomFromChange.emit(val);
  }

  onComparisonToChange(val: string): void {
    this.comparisonCustomToChange.emit(val);
  }

  onGenerate(): void {
    this.generateReport.emit();
  }

  getShortcutTranslationKey(shortcut: TimeRangeShortcut): string {
    const map: Record<TimeRangeShortcut, string> = {
      '24h': 'DASHBOARD.TIMEFRAME.LAST_24_HOURS',
      '7d': 'DASHBOARD.TIMEFRAME.LAST_7_DAYS',
      '30d': 'DASHBOARD.TIMEFRAME.LAST_30_DAYS',
      '1y': 'DASHBOARD.TIMEFRAME.LAST_YEAR',
      'custom': 'DASHBOARD.TIMEFRAME.CUSTOM'
    };
    return map[shortcut] || shortcut;
  }
}
