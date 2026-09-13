import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { SensorService } from '../../core/services/sensor.service';
import { AirQualityService } from '../../core/services/air-quality.service';
import { ReportCalculationService } from './services/report-calculation.service';
import { ReportExportService } from './services/report-export.service';

import { Sensor } from '../../models/sensor.model';
import { AirQualityReading, TimeRangeShortcut } from '../../models/air-quality.model';
import { ReportData, ReportQuery } from '../../models/report.model';

import { ReportFilterBarComponent } from './components/report-filter-bar/report-filter-bar.component';
import { ReportKpiSummaryComponent } from './components/report-kpi-summary/report-kpi-summary.component';
import { ReportTrendChartComponent } from './components/report-trend-chart/report-trend-chart.component';
import { ReportDataTableComponent } from './components/report-data-table/report-data-table.component';
import { ReportExportMenuComponent } from './components/report-export-menu/report-export-menu.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    ReportFilterBarComponent,
    ReportKpiSummaryComponent,
    ReportTrendChartComponent,
    ReportDataTableComponent,
    ReportExportMenuComponent
  ],
  template: `
    <div class="space-y-6 pb-12 print-container">
      <!-- ── Top Header Section ── -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="p-2 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </span>
            <h1 class="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {{ 'REPORTS.TITLE' | translate }}
            </h1>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {{ 'REPORTS.SUBTITLE' | translate }}
          </p>
        </div>

        <!-- Export Menu in Screen View -->
        <div class="no-print">
          <app-report-export-menu
            [disabled]="loading || !reportData"
            (exportPdf)="onExportPdf()"
            (exportExcel)="onExportExcel()"
          ></app-report-export-menu>
        </div>
      </div>

      <!-- ── Printable Header (Only rendered when printing / exporting PDF) ── -->
      <div class="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold text-slate-900">Project Aeolus — Environmental Telemetry Report</h1>
            <p class="text-xs text-slate-600 mt-1">
              Station: <strong>{{ reportData?.stationName }}</strong> (UID: {{ reportData?.stationUid }})
            </p>
          </div>
          <div class="text-right text-xs text-slate-500">
            <p>Generated: {{ reportData?.generatedAt | date:'medium' }}</p>
            <p>Period: {{ reportData?.primaryPeriodLabel }}</p>
          </div>
        </div>
      </div>

      <!-- ── Configuration Filter Bar ── -->
      <div class="no-print">
        <app-report-filter-bar
          [sensors]="sensors"
          [selectedSensorUid]="selectedSensorUid"
          [selectedShortcut]="selectedShortcut"
          [customFrom]="customFrom"
          [customTo]="customTo"
          [comparisonEnabled]="comparisonEnabled"
          [comparisonShortcut]="comparisonShortcut"
          [comparisonCustomFrom]="comparisonCustomFrom"
          [comparisonCustomTo]="comparisonCustomTo"
          [loading]="loading"
          (sensorChange)="onSensorChange($event)"
          (shortcutChange)="onShortcutChange($event)"
          (customFromChange)="customFrom = $event"
          (customToChange)="customTo = $event"
          (comparisonToggle)="onComparisonToggle($event)"
          (comparisonShortcutChange)="onComparisonShortcutChange($event)"
          (comparisonCustomFromChange)="comparisonCustomFrom = $event"
          (comparisonCustomToChange)="comparisonCustomTo = $event"
          (generateReport)="loadReportData()"
        ></app-report-filter-bar>
      </div>

      <!-- ── Error State ── -->
      @if (errorMsg) {
        <div class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-sm flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-rose-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>
          <button
            (click)="loadReportData()"
            type="button"
            class="px-3 py-1 rounded-lg text-xs font-bold bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-100 hover:bg-rose-300 transition-colors cursor-pointer"
          >
            {{ 'REPORTS.RETRY' | translate }}
          </button>
        </div>
      }

      <!-- ── Report View Components ── -->
      @if (reportData) {
        <!-- 1. KPI Summary Cards & Stoplight Compliance -->
        <app-report-kpi-summary [report]="reportData"></app-report-kpi-summary>

        <!-- 2. Overlay Trend & Comparison Chart -->
        <app-report-trend-chart [report]="reportData"></app-report-trend-chart>

        <!-- 3. Paginated Telemetry Table -->
        <div class="page-break">
          <app-report-data-table
            [primaryReadings]="reportData.primaryReadings"
            [comparisonReadings]="reportData.comparisonReadings || []"
            [primaryLabel]="reportData.primaryPeriodLabel || ''"
            [comparisonLabel]="reportData.comparisonPeriodLabel || ''"
          ></app-report-data-table>
        </div>
      } @else if (loading) {
        <div class="py-20 flex flex-col items-center justify-center text-slate-400 space-y-3">
          <svg class="animate-spin w-8 h-8 text-sky-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span class="text-sm font-medium text-slate-500">{{ 'REPORTS.LOADING_REPORT' | translate }}</span>
        </div>
      }
    </div>
  `,
  styleUrls: ['./reports.component.css']
})
export class ReportsComponent implements OnInit {
  private sensorService = inject(SensorService);
  private airQualityService = inject(AirQualityService);
  private calculationService = inject(ReportCalculationService);
  private exportService = inject(ReportExportService);
  private cdr = inject(ChangeDetectorRef);

  sensors: Sensor[] = [];
  selectedSensorUid = '';
  selectedShortcut: TimeRangeShortcut = '30d';
  customFrom = '';
  customTo = '';

  comparisonEnabled = false;
  comparisonShortcut: TimeRangeShortcut = '30d';
  comparisonCustomFrom = '';
  comparisonCustomTo = '';

  loading = false;
  errorMsg: string | null = null;
  reportData: ReportData | null = null;

  ngOnInit(): void {
    this.fetchSensors();
  }

  fetchSensors(): void {
    this.loading = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    this.sensorService.getSensors().subscribe({
      next: (sensors) => {
        this.sensors = sensors || [];
        if (this.sensors.length > 0) {
          this.selectedSensorUid = this.sensors[0].uidSensor;
          this.loadReportData();
        } else {
          this.loading = false;
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Failed to load monitoring stations.';
        this.cdr.markForCheck();
      }
    });
  }

  onSensorChange(uid: string): void {
    this.selectedSensorUid = uid;
    this.loadReportData();
  }

  onShortcutChange(shortcut: TimeRangeShortcut): void {
    this.selectedShortcut = shortcut;
    if (shortcut === 'custom' && (!this.customFrom || !this.customTo)) {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      this.customTo = today.toISOString().slice(0, 10);
      this.customFrom = thirtyDaysAgo.toISOString().slice(0, 10);
    }
    if (shortcut !== 'custom') {
      this.loadReportData();
    }
  }

  onComparisonToggle(enabled: boolean): void {
    this.comparisonEnabled = enabled;
    if (enabled) {
      this.comparisonShortcut = 'custom';
      if (!this.comparisonCustomFrom || !this.comparisonCustomTo) {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(today.getDate() - 60);
        this.comparisonCustomTo = thirtyDaysAgo.toISOString().slice(0, 10);
        this.comparisonCustomFrom = sixtyDaysAgo.toISOString().slice(0, 10);
      }
    }
  }

  onComparisonShortcutChange(shortcut: TimeRangeShortcut): void {
    this.comparisonShortcut = shortcut;
    if (shortcut === 'custom' && (!this.comparisonCustomFrom || !this.comparisonCustomTo)) {
      const today = new Date();
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(today.getDate() - 60);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      this.comparisonCustomTo = thirtyDaysAgo.toISOString().slice(0, 10);
      this.comparisonCustomFrom = sixtyDaysAgo.toISOString().slice(0, 10);
    }
  }

  loadReportData(): void {
    if (!this.selectedSensorUid) {
      this.loading = false;
      this.cdr.markForCheck();
      return;
    }

    if (this.selectedShortcut === 'custom') {
      if (!this.customFrom || !this.customTo) {
        this.loading = false;
        this.errorMsg = 'Please select both start and end dates for the report.';
        this.cdr.markForCheck();
        return;
      }
      if (this.customFrom > this.customTo) {
        this.loading = false;
        this.errorMsg = 'Report start date cannot be after end date.';
        this.cdr.markForCheck();
        return;
      }
    }

    if (this.comparisonEnabled && this.comparisonShortcut === 'custom') {
      if (!this.comparisonCustomFrom || !this.comparisonCustomTo) {
        this.loading = false;
        this.errorMsg = 'Please select both start and end dates for the comparison period.';
        this.cdr.markForCheck();
        return;
      }
      if (this.comparisonCustomFrom > this.comparisonCustomTo) {
        this.loading = false;
        this.errorMsg = 'Comparison start date cannot be after end date.';
        this.cdr.markForCheck();
        return;
      }
    }

    this.loading = true;
    this.errorMsg = null;
    this.cdr.markForCheck();

    const sensor = this.sensors.find(s => s.uidSensor === this.selectedSensorUid);
    const deviceName = sensor ? sensor.name : this.selectedSensorUid;

    const query: ReportQuery = {
      deviceId: this.selectedSensorUid,
      deviceName,
      rangeShortcut: this.selectedShortcut,
      from: this.selectedShortcut === 'custom' ? this.customFrom : undefined,
      to: this.selectedShortcut === 'custom' ? this.customTo : undefined,
      comparisonEnabled: this.comparisonEnabled,
      comparisonRangeShortcut: this.comparisonEnabled ? this.comparisonShortcut : undefined,
      comparisonFrom: this.comparisonEnabled && this.comparisonShortcut === 'custom' ? this.comparisonCustomFrom : undefined,
      comparisonTo: this.comparisonEnabled && this.comparisonShortcut === 'custom' ? this.comparisonCustomTo : undefined
    };

    const primaryReq = this.airQualityService.getHistoricalReadings({
      deviceId: query.deviceId,
      rangeShortcut: query.rangeShortcut,
      from: query.from,
      to: query.to
    }).pipe(
      catchError(() => of({ readings: [] as AirQualityReading[] }))
    );

    let comparisonReq = of({ readings: [] as AirQualityReading[] });
    if (this.comparisonEnabled) {
      comparisonReq = this.airQualityService.getHistoricalReadings({
        deviceId: query.deviceId,
        rangeShortcut: query.comparisonRangeShortcut,
        from: query.comparisonFrom,
        to: query.comparisonTo
      }).pipe(
        catchError(() => of({ readings: [] as AirQualityReading[] }))
      );
    }

    forkJoin({
      primary: primaryReq,
      comparison: comparisonReq
    }).subscribe({
      next: ({ primary, comparison }) => {
        this.loading = false;
        this.reportData = this.calculationService.generateReportData(
          query,
          primary.readings || [],
          this.comparisonEnabled ? (comparison.readings || []) : undefined
        );
        this.cdr.markForCheck();
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Error querying environmental telemetry records.';
        this.cdr.markForCheck();
      }
    });
  }

  onExportPdf(): void {
    this.exportService.triggerPrintPdf();
  }

  onExportExcel(): void {
    if (this.reportData) {
      this.exportService.exportToExcel(this.reportData);
    }
  }

  onExportCsv(): void {
    if (this.reportData) {
      this.exportService.exportToCsv(this.reportData);
    }
  }
}
