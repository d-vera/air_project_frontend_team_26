import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportKpiSummaryComponent } from './report-kpi-summary.component';
import { ReportData } from '../../../../models/report.model';

describe('ReportKpiSummaryComponent', () => {
  let component: ReportKpiSummaryComponent;
  let fixture: ComponentFixture<ReportKpiSummaryComponent>;

  const mockReport: ReportData = {
    query: {
      deviceId: 'SENSOR-001',
      deviceName: 'Station Alpha',
      rangeShortcut: '30d',
      comparisonEnabled: false
    },
    generatedAt: '2026-09-08T12:00:00Z',
    stationName: 'Station Alpha',
    stationUid: 'SENSOR-001',
    primaryPeriodLabel: 'Last 30 Days',
    primaryReadings: [],
    statistics: {
      pm2_5: { parameter: 'pm2_5', label: 'PM 2.5', unit: 'µg/m³', mean: 15.0, min: 10, max: 20, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 15.0, readingsCount: 10 },
      pm10: { parameter: 'pm10', label: 'PM 10', unit: 'µg/m³', mean: 30.0, min: 20, max: 40, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 30.0, readingsCount: 10 },
      co2: { parameter: 'co2', label: 'CO₂', unit: 'ppm', mean: 500, min: 400, max: 600, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 500, readingsCount: 10 },
      pm1_0: { parameter: 'pm1_0', label: 'PM 1.0', unit: 'µg/m³', mean: 8.0, min: 5, max: 12, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 8.0, readingsCount: 10 },
      temperature: { parameter: 'temperature', label: 'Temperature', unit: '°C', mean: 22.0, min: 19, max: 25, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 22.0, readingsCount: 10 },
      humidity: { parameter: 'humidity', label: 'Humidity', unit: '%', mean: 55.0, min: 40, max: 65, peakTimestamp: '2026-09-08T10:00:00Z', latestValue: 55.0, readingsCount: 10 }
    },
    stoplightDistribution: {
      greenCount: 8,
      yellowCount: 2,
      orangeCount: 0,
      redCount: 0,
      totalCount: 10,
      complianceRate: 100
    },
    worstSeverity: 'yellow'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportKpiSummaryComponent],
      providers: [provideTranslateService()]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportKpiSummaryComponent);
    component = fixture.componentInstance;
    component.report = mockReport;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate correct percentage for progress bar', () => {
    expect(component.getPercent(8)).toBe(80);
    expect(component.getPercent(2)).toBe(20);
  });

  it('should format timestamps cleanly', () => {
    const formatted = component.formatTime('2026-09-08T14:30:00Z');
    expect(formatted).toContain('9/8');
  });
});
