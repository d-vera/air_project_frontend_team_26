import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportTrendChartComponent } from './report-trend-chart.component';
import { ReportCalculationService } from '../../services/report-calculation.service';
import { ThemeService } from '../../../../core/services/theme.service';
import { ReportData } from '../../../../models/report.model';

describe('ReportTrendChartComponent', () => {
  let component: ReportTrendChartComponent;
  let fixture: ComponentFixture<ReportTrendChartComponent>;

  const mockReport: ReportData = {
    query: {
      deviceId: 'SENSOR-001',
      deviceName: 'Station Alpha',
      rangeShortcut: '30d',
      comparisonEnabled: true,
      comparisonRangeShortcut: '30d'
    },
    generatedAt: '2026-09-08T12:00:00Z',
    stationName: 'Station Alpha',
    stationUid: 'SENSOR-001',
    primaryPeriodLabel: 'Last 30 Days',
    comparisonPeriodLabel: 'Previous 30 Days',
    primaryReadings: [
      { deviceId: 'SENSOR-001', time: '2026-09-08T10:00:00Z', pm2_5: 15, pm10: 30, pm1_0: 8, co2: 500, temperature: 22, humidity: 55 }
    ],
    comparisonReadings: [
      { deviceId: 'SENSOR-001', time: '2026-08-08T10:00:00Z', pm2_5: 20, pm10: 35, pm1_0: 10, co2: 600, temperature: 21, humidity: 50 }
    ],
    statistics: {
      pm2_5: { parameter: 'pm2_5', label: 'PM 2.5', unit: 'µg/m³', mean: 15, min: 15, max: 15, peakTimestamp: '', latestValue: 15, readingsCount: 1 },
      pm10: { parameter: 'pm10', label: 'PM 10', unit: 'µg/m³', mean: 30, min: 30, max: 30, peakTimestamp: '', latestValue: 30, readingsCount: 1 },
      co2: { parameter: 'co2', label: 'CO₂', unit: 'ppm', mean: 500, min: 500, max: 500, peakTimestamp: '', latestValue: 500, readingsCount: 1 },
      pm1_0: { parameter: 'pm1_0', label: 'PM 1.0', unit: 'µg/m³', mean: 8, min: 8, max: 8, peakTimestamp: '', latestValue: 8, readingsCount: 1 },
      temperature: { parameter: 'temperature', label: 'Temperature', unit: '°C', mean: 22, min: 22, max: 22, peakTimestamp: '', latestValue: 22, readingsCount: 1 },
      humidity: { parameter: 'humidity', label: 'Humidity', unit: '%', mean: 55, min: 55, max: 55, peakTimestamp: '', latestValue: 55, readingsCount: 1 }
    },
    stoplightDistribution: { greenCount: 1, yellowCount: 0, orangeCount: 0, redCount: 0, totalCount: 1, complianceRate: 100 },
    worstSeverity: 'green'
  };

  beforeEach(async () => {
    // Mock getContext for canvas in jsdom
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      canvas: document.createElement('canvas'),
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      translate: vi.fn(),
      transform: vi.fn(),
      setTransform: vi.fn(),
      resetTransform: vi.fn(),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createPattern: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 0 }),
      drawImage: vi.fn()
    } as unknown as CanvasRenderingContext2D);

    const mockThemeService = {
      isDarkMode: vi.fn().mockReturnValue(false)
    };

    await TestBed.configureTestingModule({
      imports: [ReportTrendChartComponent],
      providers: [
        ReportCalculationService,
        { provide: ThemeService, useValue: mockThemeService },
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportTrendChartComponent);
    component = fixture.componentInstance;
    component.report = mockReport;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should change metric and update threshold note', () => {
    component.selectMetric('co2');
    expect(component.selectedMetric).toBe('co2');
    expect(component.thresholdNote).toContain('700 ppm');

    component.selectMetric('temperature');
    expect(component.selectedMetric).toBe('temperature');
    expect(component.thresholdNote).toContain('18.0°C');
  });
});
