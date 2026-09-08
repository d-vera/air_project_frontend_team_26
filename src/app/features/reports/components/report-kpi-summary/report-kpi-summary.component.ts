import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { REPORT_PARAMETERS, ReportData } from '../../../../models/report.model';

@Component({
  selector: 'app-report-kpi-summary',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (report) {
      <div class="space-y-6">
        <!-- ── Top Status Banner & Compliance ── -->
        <div
          class="p-5 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
          [ngClass]="{
            'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60': report.worstSeverity === 'green',
            'bg-amber-50/80 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800/60': report.worstSeverity === 'yellow',
            'bg-orange-50/80 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800/60': report.worstSeverity === 'orange',
            'bg-rose-50/80 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/60': report.worstSeverity === 'red'
          }"
        >
          <div class="flex items-center gap-3.5">
            <div
              class="w-11 h-11 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
              [ngClass]="{
                'bg-emerald-500 text-white': report.worstSeverity === 'green',
                'bg-amber-500 text-white': report.worstSeverity === 'yellow',
                'bg-orange-500 text-white': report.worstSeverity === 'orange',
                'bg-rose-500 text-white': report.worstSeverity === 'red'
              }"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {{ 'REPORTS.COMPLIANCE_TITLE' | translate }}
                </h3>
                <span
                  class="px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider"
                  [ngClass]="{
                    'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200': report.worstSeverity === 'green',
                    'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200': report.worstSeverity === 'yellow',
                    'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200': report.worstSeverity === 'orange',
                    'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200': report.worstSeverity === 'red'
                  }"
                >
                  {{ 'REPORTS.SEVERITY_' + report.worstSeverity.toUpperCase() | translate }}
                </span>
              </div>
              <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                {{ report.primaryPeriodLabel }} — {{ report.stationName }} ({{ report.stationUid }})
              </p>
            </div>
          </div>

          <!-- Compliance Metric & Progress Bar -->
          <div class="w-full md:w-72 space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-slate-600 dark:text-slate-300">{{ 'REPORTS.COMPLIANCE_RATE' | translate }}</span>
              <span class="font-extrabold text-slate-900 dark:text-slate-100">{{ report.stoplightDistribution.complianceRate }}%</span>
            </div>
            <div class="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
              <div
                class="bg-emerald-500 h-full transition-all"
                [style.width.%]="getPercent(report.stoplightDistribution.greenCount)"
                [title]="'Green: ' + report.stoplightDistribution.greenCount"
              ></div>
              <div
                class="bg-amber-400 h-full transition-all"
                [style.width.%]="getPercent(report.stoplightDistribution.yellowCount)"
                [title]="'Yellow: ' + report.stoplightDistribution.yellowCount"
              ></div>
              <div
                class="bg-orange-500 h-full transition-all"
                [style.width.%]="getPercent(report.stoplightDistribution.orangeCount)"
                [title]="'Orange: ' + report.stoplightDistribution.orangeCount"
              ></div>
              <div
                class="bg-rose-500 h-full transition-all"
                [style.width.%]="getPercent(report.stoplightDistribution.redCount)"
                [title]="'Red: ' + report.stoplightDistribution.redCount"
              ></div>
            </div>
            <div class="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              <span>🟢 {{ report.stoplightDistribution.greenCount }}</span>
              <span>🟡 {{ report.stoplightDistribution.yellowCount }}</span>
              <span>🟠 {{ report.stoplightDistribution.orangeCount }}</span>
              <span>🔴 {{ report.stoplightDistribution.redCount }}</span>
            </div>
          </div>
        </div>

        <!-- ── Metric Cards Grid ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (meta of parameters; track meta.key) {
            @if (report.statistics[meta.key]; as stat) {
              <div class="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden transition-all hover:border-slate-300 dark:hover:border-slate-700">
                <div class="flex items-start justify-between">
                  <div>
                    <span class="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {{ meta.translationKey | translate }}
                    </span>
                    <div class="flex items-baseline gap-1.5 mt-1">
                      <span class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {{ stat.mean }}
                      </span>
                      <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {{ meta.unit }}
                      </span>
                    </div>
                  </div>

                  <!-- Comparison Delta Badge if present -->
                  @if (report.deltas && report.deltas[meta.key]; as delta) {
                    <div
                      class="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300': delta.isImprovement,
                        'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300': !delta.isImprovement
                      }"
                    >
                      @if (delta.deltaPercentage < 0) {
                        <span>▼</span>
                      } @else if (delta.deltaPercentage > 0) {
                        <span>▲</span>
                      }
                      <span>{{ delta.deltaPercentage > 0 ? '+' : '' }}{{ delta.deltaPercentage }}%</span>
                    </div>
                  }
                </div>

                <!-- Min / Max / Peak Details -->
                <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="text-slate-400 block text-[11px]">{{ 'REPORTS.MIN_MAX' | translate }}</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300">
                      {{ stat.min }} – {{ stat.max }} {{ meta.unit }}
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-400 block text-[11px]">{{ 'REPORTS.PEAK_TIME' | translate }}</span>
                    <span class="font-semibold text-slate-700 dark:text-slate-300 truncate block" [title]="stat.peakTimestamp">
                      {{ formatTime(stat.peakTimestamp) }}
                    </span>
                  </div>
                </div>
              </div>
            }
          }
        </div>
      </div>
    }
  `
})
export class ReportKpiSummaryComponent {
  @Input() report: ReportData | null = null;
  readonly parameters = REPORT_PARAMETERS;

  getPercent(count: number): number {
    if (!this.report || this.report.stoplightDistribution.totalCount === 0) return 0;
    return (count / this.report.stoplightDistribution.totalCount) * 100;
  }

  formatTime(isoString: string): string {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  }
}
