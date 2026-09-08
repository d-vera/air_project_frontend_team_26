import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
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
import {
  REPORT_PARAMETERS,
  ReportData,
  ReportParameter
} from '../../../../models/report.model';
import { ReportCalculationService } from '../../services/report-calculation.service';
import { ThemeService } from '../../../../core/services/theme.service';

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
  selector: 'app-report-trend-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <svg class="w-5 h-5 text-sky-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            {{ 'REPORTS.CHART_TITLE' | translate }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ 'REPORTS.CHART_SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Metric Selector Tabs -->
        <div class="flex flex-wrap items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl">
          @for (meta of parameters; track meta.key) {
            <button
              (click)="selectMetric(meta.key)"
              type="button"
              [class.bg-white]="selectedMetric === meta.key"
              [class.dark:bg-slate-900]="selectedMetric === meta.key"
              [class.text-sky-600]="selectedMetric === meta.key"
              [class.dark:text-sky-400]="selectedMetric === meta.key"
              [class.shadow-xs]="selectedMetric === meta.key"
              class="px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-all cursor-pointer"
            >
              {{ meta.label }}
            </button>
          }
        </div>
      </div>

      <!-- Chart Canvas Wrapper -->
      <div class="relative w-full h-80 sm:h-96">
        <canvas #chartCanvas></canvas>
      </div>

      <!-- Threshold Note -->
      @if (thresholdNote) {
        <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <span class="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
          <span>{{ thresholdNote }}</span>
        </div>
      }
    </div>
  `
})
export class ReportTrendChartComponent implements AfterViewInit, OnChanges, OnDestroy {
  private calculationService = inject(ReportCalculationService);
  private themeService = inject(ThemeService);

  @Input() report: ReportData | null = null;
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  readonly parameters = REPORT_PARAMETERS;
  selectedMetric: ReportParameter = 'pm2_5';
  private chart: Chart | null = null;

  get thresholdNote(): string {
    switch (this.selectedMetric) {
      case 'pm2_5': return 'WHO 24h Optimal Guideline: ≤ 15.0 µg/m³ (Moderate: 15.1–35.0 µg/m³)';
      case 'pm10': return 'WHO 24h Optimal Guideline: ≤ 45.0 µg/m³ (Moderate: 45.1–100.0 µg/m³)';
      case 'pm1_0': return 'Optimal Level: ≤ 10.0 µg/m³ (Moderate: 10.1–25.0 µg/m³)';
      case 'co2': return 'Optimal Indoor/Outdoor: ≤ 700 ppm (Acceptable: 701–1000 ppm)';
      case 'temperature': return 'Thermal Comfort Band: 18.0°C – 24.0°C';
      case 'humidity': return 'Optimal Relative Humidity: 35.0% – 60.0%';
      default: return '';
    }
  }

  ngAfterViewInit(): void {
    this.renderChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['report']) {
      this.renderChart();
    }
  }

  ngOnDestroy(): void {
    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }
  }

  selectMetric(metric: ReportParameter): void {
    this.selectedMetric = metric;
    this.renderChart();
  }

  renderChart(): void {
    if (!this.chartCanvas || !this.report) {
      return;
    }

    if (this.chart) {
      this.chart.destroy();
      this.chart = null;
    }

    const series = this.calculationService.prepareOverlaySeries(
      this.report.primaryReadings,
      this.report.comparisonReadings,
      this.selectedMetric
    );

    const isDark = this.themeService.isDarkMode();
    const primaryLabel = this.report.primaryPeriodLabel || 'Primary Period';
    const compLabel = this.report.comparisonPeriodLabel || 'Comparison Period';

    const labels = series.primaryPoints.map(p => p.label);
    const primaryData = series.primaryPoints.map(p => p.value);

    // Primary dataset
    const datasets: ChartConfiguration<'line'>['data']['datasets'] = [
      {
        label: `${primaryLabel} (${series.unit})`,
        data: primaryData,
        borderColor: '#0284c7', // Sky-600
        backgroundColor: 'rgba(2, 132, 199, 0.08)',
        borderWidth: 2.5,
        tension: 0.3,
        fill: true,
        pointRadius: primaryData.length > 50 ? 0 : 3,
        pointHoverRadius: 6
      }
    ];

    // Overlay comparison dataset if available
    if (series.comparisonPoints && series.comparisonPoints.length > 0) {
      const compData = series.comparisonPoints.map(p => p.value);
      datasets.push({
        label: `${compLabel} (${series.unit})`,
        data: compData,
        borderColor: '#8b5cf6', // Violet-500
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        tension: 0.3,
        fill: false,
        pointRadius: compData.length > 50 ? 0 : 3,
        pointHoverRadius: 6
      });
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: isDark ? '#94a3b8' : '#475569',
              font: { family: 'inherit', size: 12, weight: 'bold' }
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            titleColor: isDark ? '#f8fafc' : '#0f172a',
            bodyColor: isDark ? '#cbd5e1' : '#334155',
            borderColor: isDark ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 10,
            cornerRadius: 12
          }
        },
        scales: {
          x: {
            grid: {
              color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)'
            },
            ticks: {
              color: isDark ? '#64748b' : '#94a3b8',
              maxRotation: 45,
              maxTicksLimit: 12
            }
          },
          y: {
            grid: {
              color: isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.6)'
            },
            ticks: {
              color: isDark ? '#64748b' : '#94a3b8'
            }
          }
        }
      }
    };

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (ctx) {
      this.chart = new Chart(ctx, config);
    }
  }
}
