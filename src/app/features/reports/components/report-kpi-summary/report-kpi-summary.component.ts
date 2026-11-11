import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { REPORT_PARAMETERS, ReportData, StoplightDistribution } from '../../../../models/report.model';

@Component({
  selector: 'app-report-kpi-summary',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    @if (report) {
      <div class="space-y-6">
        <!-- ── Top Status Banner(s) & Compliance ── -->
        @if (hasComparison) {
          <!-- Side-by-side comparison badges -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- 1. Primary Period Badge -->
            <div
              class="p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all"
              [ngClass]="{
                'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80': report.worstSeverity === 'green',
                'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80': report.worstSeverity === 'yellow',
                'bg-orange-50/80 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/80': report.worstSeverity === 'orange',
                'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80': report.worstSeverity === 'red'
              }"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
                    <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                    {{ 'REPORTS.PERIOD_PRIMARY' | translate }}
                  </span>

                  <!-- Delta pill vs baseline -->
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300': complianceDelta > 0,
                      'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300': complianceDelta < 0,
                      'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300': complianceDelta === 0
                    }"
                  >
                    <span>{{ complianceDelta > 0 ? '▲ +' : complianceDelta < 0 ? '▼ ' : '= ' }}{{ complianceDelta }}%</span>
                    <span class="text-[10px] font-medium opacity-80">{{ 'REPORTS.VS_BASELINE' | translate }}</span>
                  </span>
                </div>

                <div class="flex items-start gap-3.5">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
                    [ngClass]="{
                      'bg-emerald-500 text-white': report.worstSeverity === 'green',
                      'bg-amber-500 text-white': report.worstSeverity === 'yellow',
                      'bg-orange-500 text-white': report.worstSeverity === 'orange',
                      'bg-rose-500 text-white': report.worstSeverity === 'red'
                    }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
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
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                      {{ report.primaryPeriodLabel }} — {{ report.stationName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Compliance Metric & Progress Bar with detailed % -->
              <div class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div class="flex items-baseline justify-between text-xs">
                  <div>
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ 'REPORTS.COMPLIANCE_RATE' | translate }}</span>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400">
                      {{ getCompliantCount(report.stoplightDistribution) }} de {{ report.stoplightDistribution.totalCount }} lecturas conformes (🟢+🟡)
                    </p>
                  </div>
                  <span class="text-base font-extrabold text-slate-900 dark:text-slate-100">{{ report.stoplightDistribution.complianceRate }}%</span>
                </div>

                <div class="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    class="bg-emerald-500 h-full transition-all"
                    [style.width.%]="getPercent(report.stoplightDistribution.greenCount, report.stoplightDistribution.totalCount)"
                    [title]="'Green: ' + report.stoplightDistribution.greenCount"
                  ></div>
                  <div
                    class="bg-amber-400 h-full transition-all"
                    [style.width.%]="getPercent(report.stoplightDistribution.yellowCount, report.stoplightDistribution.totalCount)"
                    [title]="'Yellow: ' + report.stoplightDistribution.yellowCount"
                  ></div>
                  <div
                    class="bg-orange-500 h-full transition-all"
                    [style.width.%]="getPercent(report.stoplightDistribution.orangeCount, report.stoplightDistribution.totalCount)"
                    [title]="'Orange: ' + report.stoplightDistribution.orangeCount"
                  ></div>
                  <div
                    class="bg-rose-500 h-full transition-all"
                    [style.width.%]="getPercent(report.stoplightDistribution.redCount, report.stoplightDistribution.totalCount)"
                    [title]="'Red: ' + report.stoplightDistribution.redCount"
                  ></div>
                </div>

                <div class="grid grid-cols-4 gap-1 text-[10.5px] font-semibold text-center text-slate-600 dark:text-slate-300">
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Óptimo">
                    🟢 {{ getPercent(report.stoplightDistribution.greenCount, report.stoplightDistribution.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.greenCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Moderado">
                    🟡 {{ getPercent(report.stoplightDistribution.yellowCount, report.stoplightDistribution.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.yellowCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Dañino">
                    🟠 {{ getPercent(report.stoplightDistribution.orangeCount, report.stoplightDistribution.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.orangeCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Crítico">
                    🔴 {{ getPercent(report.stoplightDistribution.redCount, report.stoplightDistribution.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.redCount }})</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- 2. Secondary / Comparison Baseline Badge -->
            <div
              class="p-5 rounded-3xl border flex flex-col justify-between gap-4 transition-all"
              [ngClass]="{
                'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80': report.comparisonWorstSeverity === 'green',
                'bg-amber-50/80 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/80': report.comparisonWorstSeverity === 'yellow',
                'bg-orange-50/80 dark:bg-orange-950/20 border-orange-300 dark:border-orange-800/80': report.comparisonWorstSeverity === 'orange',
                'bg-rose-50/80 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80': report.comparisonWorstSeverity === 'red'
              }"
            >
              <div>
                <div class="flex items-center justify-between gap-2 mb-3">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-300 dark:border-violet-800">
                    <span class="w-2 h-2 rounded-full bg-violet-500"></span>
                    {{ 'REPORTS.PERIOD_COMPARISON' | translate }}
                  </span>
                  <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    Línea Base de Referencia
                  </span>
                </div>

                <div class="flex items-start gap-3.5">
                  <div
                    class="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
                    [ngClass]="{
                      'bg-emerald-500 text-white': report.comparisonWorstSeverity === 'green',
                      'bg-amber-500 text-white': report.comparisonWorstSeverity === 'yellow',
                      'bg-orange-500 text-white': report.comparisonWorstSeverity === 'orange',
                      'bg-rose-500 text-white': report.comparisonWorstSeverity === 'red'
                    }"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {{ 'REPORTS.COMPLIANCE_TITLE' | translate }}
                      </h3>
                      <span
                        class="px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider"
                        [ngClass]="{
                          'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200': report.comparisonWorstSeverity === 'green',
                          'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200': report.comparisonWorstSeverity === 'yellow',
                          'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200': report.comparisonWorstSeverity === 'orange',
                          'bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200': report.comparisonWorstSeverity === 'red'
                        }"
                      >
                        {{ 'REPORTS.SEVERITY_' + report.comparisonWorstSeverity!.toUpperCase() | translate }}
                      </span>
                    </div>
                    <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 truncate">
                      {{ report.comparisonPeriodLabel }} — {{ report.stationName }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Compliance Metric & Progress Bar with detailed % -->
              <div class="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <div class="flex items-baseline justify-between text-xs">
                  <div>
                    <span class="font-bold text-slate-700 dark:text-slate-200">{{ 'REPORTS.COMPLIANCE_RATE' | translate }}</span>
                    <p class="text-[10px] text-slate-500 dark:text-slate-400">
                      {{ getCompliantCount(report.comparisonStoplightDistribution) }} de {{ report.comparisonStoplightDistribution!.totalCount }} lecturas conformes (🟢+🟡)
                    </p>
                  </div>
                  <span class="text-base font-extrabold text-slate-900 dark:text-slate-100">{{ report.comparisonStoplightDistribution!.complianceRate }}%</span>
                </div>

                <div class="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                  <div
                    class="bg-emerald-500 h-full transition-all"
                    [style.width.%]="getPercent(report.comparisonStoplightDistribution!.greenCount, report.comparisonStoplightDistribution!.totalCount)"
                    [title]="'Green: ' + report.comparisonStoplightDistribution!.greenCount"
                  ></div>
                  <div
                    class="bg-amber-400 h-full transition-all"
                    [style.width.%]="getPercent(report.comparisonStoplightDistribution!.yellowCount, report.comparisonStoplightDistribution!.totalCount)"
                    [title]="'Yellow: ' + report.comparisonStoplightDistribution!.yellowCount"
                  ></div>
                  <div
                    class="bg-orange-500 h-full transition-all"
                    [style.width.%]="getPercent(report.comparisonStoplightDistribution!.orangeCount, report.comparisonStoplightDistribution!.totalCount)"
                    [title]="'Orange: ' + report.comparisonStoplightDistribution!.orangeCount"
                  ></div>
                  <div
                    class="bg-rose-500 h-full transition-all"
                    [style.width.%]="getPercent(report.comparisonStoplightDistribution!.redCount, report.comparisonStoplightDistribution!.totalCount)"
                    [title]="'Red: ' + report.comparisonStoplightDistribution!.redCount"
                  ></div>
                </div>

                <div class="grid grid-cols-4 gap-1 text-[10.5px] font-semibold text-center text-slate-600 dark:text-slate-300">
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Óptimo">
                    🟢 {{ getPercent(report.comparisonStoplightDistribution!.greenCount, report.comparisonStoplightDistribution!.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.comparisonStoplightDistribution!.greenCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Moderado">
                    🟡 {{ getPercent(report.comparisonStoplightDistribution!.yellowCount, report.comparisonStoplightDistribution!.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.comparisonStoplightDistribution!.yellowCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Dañino">
                    🟠 {{ getPercent(report.comparisonStoplightDistribution!.orangeCount, report.comparisonStoplightDistribution!.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.comparisonStoplightDistribution!.orangeCount }})</span>
                  </span>
                  <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Crítico">
                    🔴 {{ getPercent(report.comparisonStoplightDistribution!.redCount, report.comparisonStoplightDistribution!.totalCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.comparisonStoplightDistribution!.redCount }})</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Comparative Explanation Callout -->
          <div class="p-4 bg-slate-100/90 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start gap-3 text-xs text-slate-600 dark:text-slate-300">
            <svg class="w-5 h-5 text-sky-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div class="space-y-1">
              <p class="font-bold text-slate-900 dark:text-slate-100">
                Comparativa de Cumplimiento Normativo OMS
              </p>
              <p class="leading-relaxed">
                El Periodo Principal registró un <strong>{{ report.stoplightDistribution.complianceRate }}%</strong> de cumplimiento frente al <strong>{{ report.comparisonStoplightDistribution!.complianceRate }}%</strong> de la Referencia
                <span
                  class="font-bold"
                  [ngClass]="{
                    'text-emerald-600 dark:text-emerald-400': complianceDelta > 0,
                    'text-rose-600 dark:text-rose-400': complianceDelta < 0,
                    'text-slate-600 dark:text-slate-400': complianceDelta === 0
                  }"
                >
                  ({{ complianceDelta > 0 ? '+' : '' }}{{ complianceDelta }}% de diferencia)
                </span>.
                La tasa mide la proporción de lecturas en niveles tolerables (🟢 Óptimo + 🟡 Moderado) que evitan contingencias ambientales (🟠 Dañino o 🔴 Crítico).
              </p>
            </div>
          </div>
        } @else {
          <!-- Single Period Compliance Banner (non-comparison mode) -->
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
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {{ getCompliantCount(report.stoplightDistribution) }} de {{ report.stoplightDistribution.totalCount }} lecturas conformes (🟢 Óptimo + 🟡 Moderado)
                </p>
              </div>
            </div>

            <!-- Compliance Metric & Progress Bar with detailed % -->
            <div class="w-full md:w-80 space-y-2">
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
              <div class="grid grid-cols-4 gap-1 text-[10.5px] font-semibold text-center text-slate-600 dark:text-slate-300">
                <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Óptimo">
                  🟢 {{ getPercent(report.stoplightDistribution.greenCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.greenCount }})</span>
                </span>
                <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Moderado">
                  🟡 {{ getPercent(report.stoplightDistribution.yellowCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.yellowCount }})</span>
                </span>
                <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Dañino">
                  🟠 {{ getPercent(report.stoplightDistribution.orangeCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.orangeCount }})</span>
                </span>
                <span class="bg-white/60 dark:bg-slate-900/60 py-0.5 rounded-md" title="Nivel Crítico">
                  🔴 {{ getPercent(report.stoplightDistribution.redCount) }}% <span class="text-[10px] font-normal text-slate-400">({{ report.stoplightDistribution.redCount }})</span>
                </span>
              </div>
            </div>
          </div>
        }

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

  get hasComparison(): boolean {
    return !!(
      this.report?.query.comparisonEnabled &&
      this.report.comparisonStoplightDistribution &&
      this.report.comparisonWorstSeverity
    );
  }

  get complianceDelta(): number {
    if (!this.report || !this.report.comparisonStoplightDistribution) return 0;
    const p = this.report.stoplightDistribution.complianceRate;
    const c = this.report.comparisonStoplightDistribution.complianceRate;
    return Math.round((p - c) * 10) / 10;
  }

  getPercent(count: number, total?: number): number {
    const divisor = total ?? this.report?.stoplightDistribution?.totalCount ?? 0;
    if (divisor === 0) return 0;
    return Math.round((count / divisor) * 1000) / 10;
  }

  getCompliantCount(dist?: StoplightDistribution): number {
    if (!dist) return 0;
    return dist.greenCount + dist.yellowCount;
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
