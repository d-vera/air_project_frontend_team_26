import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  inject,
  OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AirQualityReading,
  TimeRangeShortcut,
  CustomDateRange
} from '../../../../models/air-quality.model';
import { AuthService } from '../../../../core/services/auth.service';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler,
  ChartConfiguration
} from 'chart.js';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
  Filler
);

@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <!-- Header and Time Shortcuts -->
      <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            {{ 'DASHBOARD.HISTORICAL_TITLE' | translate }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            {{ 'DASHBOARD.HISTORICAL_SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Shortcuts Pill Selector -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl">
          <!-- 24 Hours -->
          <button
            (click)="selectShortcut('24h')"
            type="button"
            [class.bg-white]="activeShortcut === '24h'"
            [class.dark:bg-slate-900]="activeShortcut === '24h'"
            [class.text-sky-600]="activeShortcut === '24h'"
            [class.dark:text-sky-400]="activeShortcut === '24h'"
            [class.shadow-xs]="activeShortcut === '24h'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
          >
            {{ 'DASHBOARD.TIMEFRAME.LAST_24_HOURS' | translate }}
          </button>

          <!-- 7 Days -->
          <button
            (click)="selectShortcut('7d')"
            type="button"
            [class.bg-white]="activeShortcut === '7d'"
            [class.dark:bg-slate-900]="activeShortcut === '7d'"
            [class.text-sky-600]="activeShortcut === '7d'"
            [class.dark:text-sky-400]="activeShortcut === '7d'"
            [class.shadow-xs]="activeShortcut === '7d'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
          >
            {{ 'DASHBOARD.TIMEFRAME.LAST_7_DAYS' | translate }}
          </button>

          <!-- 30 Days -->
          <button
            (click)="selectShortcut('30d')"
            type="button"
            [class.bg-white]="activeShortcut === '30d'"
            [class.dark:bg-slate-900]="activeShortcut === '30d'"
            [class.text-sky-600]="activeShortcut === '30d'"
            [class.dark:text-sky-400]="activeShortcut === '30d'"
            [class.shadow-xs]="activeShortcut === '30d'"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
          >
            {{ 'DASHBOARD.TIMEFRAME.LAST_30_DAYS' | translate }}
          </button>

          <!-- Last Year (Restricted) -->
          <button
            (click)="selectShortcut('1y')"
            type="button"
            [class.bg-white]="activeShortcut === '1y'"
            [class.dark:bg-slate-900]="activeShortcut === '1y'"
            [class.text-sky-600]="activeShortcut === '1y'"
            [class.dark:text-sky-400]="activeShortcut === '1y'"
            [class.shadow-xs]="activeShortcut === '1y'"
            class="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
          >
            <span>{{ 'DASHBOARD.TIMEFRAME.LAST_YEAR' | translate }}</span>
            @if (!authService.isAuthenticated()) {
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          </button>
        </div>
      </div>

      <!-- Custom Date Range Picker Controls -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <span class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
            {{ 'DASHBOARD.CUSTOM_RANGE' | translate }}
            @if (!authService.isAuthenticated()) {
              <svg class="w-3.5 h-3.5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            }
          </span>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="date"
              [(ngModel)]="fromDate"
              (focus)="checkCustomRangeAuth()"
              class="bg-white dark:bg-slate-900 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <span class="text-xs text-slate-400">{{ 'DASHBOARD.TO' | translate }}</span>
            <input
              type="date"
              [(ngModel)]="toDate"
              (focus)="checkCustomRangeAuth()"
              class="bg-white dark:bg-slate-900 text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
          </div>
        </div>

        <button
          (click)="applyCustomRange()"
          type="button"
          class="w-full sm:w-auto px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-sky-500 hover:bg-sky-600 transition-colors shadow-xs cursor-pointer"
        >
          {{ 'DASHBOARD.APPLY_FILTER' | translate }}
        </button>
      </div>

      <!-- Metric Metric Toggle Selector for Chart -->
      <div class="flex items-center space-x-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 overflow-x-auto">
        <span class="text-xs font-semibold text-slate-400 dark:text-slate-500 shrink-0">{{ 'DASHBOARD.METRIC_LABEL' | translate }}</span>
        <button
          (click)="selectedMetric = 'pm2_5'; renderChart()"
          type="button"
          [class.bg-sky-500]="selectedMetric === 'pm2_5'"
          [class.text-white]="selectedMetric === 'pm2_5'"
          [class.text-slate-600]="selectedMetric !== 'pm2_5'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          {{ 'DASHBOARD.METRICS.PM2_5' | translate }}
        </button>
        <button
          (click)="selectedMetric = 'pm10'; renderChart()"
          type="button"
          [class.bg-sky-500]="selectedMetric === 'pm10'"
          [class.text-white]="selectedMetric === 'pm10'"
          [class.text-slate-600]="selectedMetric !== 'pm10'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          {{ 'DASHBOARD.METRICS.PM10' | translate }}
        </button>
        <button
          (click)="selectedMetric = 'co2'; renderChart()"
          type="button"
          [class.bg-sky-500]="selectedMetric === 'co2'"
          [class.text-white]="selectedMetric === 'co2'"
          [class.text-slate-600]="selectedMetric !== 'co2'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          {{ 'DASHBOARD.METRICS.CO2' | translate }}
        </button>
        <button
          (click)="selectedMetric = 'temperature'; renderChart()"
          type="button"
          [class.bg-sky-500]="selectedMetric === 'temperature'"
          [class.text-white]="selectedMetric === 'temperature'"
          [class.text-slate-600]="selectedMetric !== 'temperature'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0"
        >
          {{ 'DASHBOARD.METRICS.TEMPERATURE' | translate }}
        </button>
      </div>

      <!-- Chart Canvas Wrapper -->
      <div class="relative w-full h-72 sm:h-80">
        <canvas #chartCanvas></canvas>
      </div>
    </div>
  `
})
export class HistoricalChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  authService = inject(AuthService);

  @Input() readings: AirQualityReading[] = [];
  @Input() activeShortcut: TimeRangeShortcut = '24h';
  @Output() shortcutChange = new EventEmitter<TimeRangeShortcut>();
  @Output() customRangeChange = new EventEmitter<CustomDateRange>();
  @Output() triggerAuthPrompt = new EventEmitter<void>();

  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  selectedMetric: 'pm2_5' | 'pm10' | 'co2' | 'temperature' = 'pm2_5';
  fromDate: string = '';
  toDate: string = '';

  private chart: Chart | null = null;

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['readings'] && !changes['readings'].firstChange) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  selectShortcut(shortcut: TimeRangeShortcut): void {
    if (shortcut === '1y' && !this.authService.isAuthenticated()) {
      this.triggerAuthPrompt.emit();
      return;
    }
    this.shortcutChange.emit(shortcut);
  }

  checkCustomRangeAuth(): void {
    if (!this.authService.isAuthenticated()) {
      this.triggerAuthPrompt.emit();
    }
  }

  applyCustomRange(): void {
    if (!this.authService.isAuthenticated()) {
      this.triggerAuthPrompt.emit();
      return;
    }
    if (this.fromDate && this.toDate) {
      this.customRangeChange.emit({ from: this.fromDate, to: this.toDate });
    }
  }

  private formatTimeLabel(date: Date, shortcut: TimeRangeShortcut): string {
    if (shortcut === '24h') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    if (shortcut === '7d') {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
    if (shortcut === '30d') {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    if (shortcut === '1y') {
      return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
    }
    if (this.readings.length >= 2) {
      const start = new Date(this.readings[0].time).getTime();
      const end = new Date(this.readings[this.readings.length - 1].time).getTime();
      const diffDays = Math.abs(end - start) / (1000 * 3600 * 24);
      if (diffDays <= 1) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays <= 7) {
        return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit' });
      } else if (diffDays <= 60) {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  renderChart(): void {
    if (!this.chartCanvas || !this.chartCanvas.nativeElement) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.readings.map(r => {
      const d = new Date(r.time);
      return this.formatTimeLabel(d, this.activeShortcut);
    });

    const datasetValues = this.readings.map(r => {
      switch (this.selectedMetric) {
        case 'pm2_5': return r.pm2_5;
        case 'pm10': return r.pm10;
        case 'co2': return r.co2;
        case 'temperature': return r.temperature;
      }
    });

    const labelMap: Record<string, string> = {
      pm2_5: 'PM 2.5 (µg/m³)',
      pm10: 'PM 10 (µg/m³)',
      co2: 'CO₂ (ppm)',
      temperature: 'Temperature (°C)'
    };

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: labelMap[this.selectedMetric],
            data: datasetValues,
            borderColor: '#0284c7', // sky-600
            backgroundColor: 'rgba(2, 132, 199, 0.1)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              boxWidth: 12,
              font: { size: 12, weight: 'bold' }
            }
          },
          tooltip: {
            padding: 10,
            cornerRadius: 12
          }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            grid: { color: 'rgba(226, 232, 240, 0.5)' },
            beginAtZero: false
          }
        }
      }
    };

    this.chart = new Chart(ctx, config);
  }
}
