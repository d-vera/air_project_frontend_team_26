import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportsComponent } from './reports.component';
import { SensorService } from '../../core/services/sensor.service';
import { AirQualityService } from '../../core/services/air-quality.service';
import { ReportCalculationService } from './services/report-calculation.service';
import { ReportExportService } from './services/report-export.service';
import { Sensor } from '../../models/sensor.model';
import { AirQualityReading } from '../../models/air-quality.model';
import { ThemeService } from '../../core/services/theme.service';

describe('ReportsComponent', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const mockSensors: Sensor[] = [
    {
      id: 1,
      uidSensor: 'SENSOR-001',
      name: 'Station Alpha',
      sensorType: 'ESP32_AIR',
      latitude: -12.0,
      longitude: -77.0,
      firmwareVersion: '1.0.0',
      sensorStatus: 'ONLINE',
      lastSeen: null,
      userId: null,
      active: true,
      createdAt: '',
      updatedAt: ''
    }
  ];

  const mockReadings: AirQualityReading[] = [
    {
      deviceId: 'SENSOR-001',
      time: '2026-09-08T10:00:00Z',
      pm2_5: 14.0,
      pm10: 25.0,
      pm1_0: 8.0,
      co2: 500,
      temperature: 22.0,
      humidity: 50.0
    }
  ];

  const mockSensorService = {
    getSensors: vi.fn().mockReturnValue(of(mockSensors))
  };

  const mockAirQualityService = {
    getHistoricalReadings: vi.fn().mockReturnValue(of({ readings: mockReadings }))
  };

  const mockExportService = {
    triggerPrintPdf: vi.fn(),
    exportToExcel: vi.fn(),
    exportToCsv: vi.fn()
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
      imports: [ReportsComponent],
      providers: [
        { provide: SensorService, useValue: mockSensorService },
        { provide: AirQualityService, useValue: mockAirQualityService },
        { provide: ReportExportService, useValue: mockExportService },
        { provide: ThemeService, useValue: mockThemeService },
        ReportCalculationService,
        provideTranslateService()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create and load initial station telemetry report', () => {
    expect(component).toBeTruthy();
    expect(mockSensorService.getSensors).toHaveBeenCalled();
    expect(component.selectedSensorUid).toBe('SENSOR-001');
    expect(component.reportData).toBeTruthy();
    expect(component.reportData?.stationName).toBe('Station Alpha');
  });

  it('should trigger exports on menu actions', () => {
    component.onExportPdf();
    expect(mockExportService.triggerPrintPdf).toHaveBeenCalled();

    component.onExportExcel();
    expect(mockExportService.exportToExcel).toHaveBeenCalledWith(component.reportData);

    component.onExportCsv();
    expect(mockExportService.exportToCsv).toHaveBeenCalledWith(component.reportData);
  });

  it('should handle empty sensors gracefully', () => {
    mockSensorService.getSensors.mockReturnValueOnce(of([]));
    component.fetchSensors();
    expect(component.loading).toBe(false);
    expect(component.sensors).toEqual([]);
  });

  it('should handle sensor fetch error gracefully', () => {
    mockSensorService.getSensors.mockReturnValueOnce(throwError(() => new Error('Server error')));
    component.fetchSensors();
    expect(component.loading).toBe(false);
    expect(component.errorMsg).toBe('Failed to load monitoring stations.');
  });

  it('should update selected sensor and reload data on sensor change', () => {
    component.onSensorChange('SENSOR-002');
    expect(component.selectedSensorUid).toBe('SENSOR-002');
    expect(mockAirQualityService.getHistoricalReadings).toHaveBeenCalled();
  });

  it('should initialize default dates when custom shortcut is selected', () => {
    component.customFrom = '';
    component.customTo = '';
    component.onShortcutChange('custom');
    expect(component.selectedShortcut).toBe('custom');
    expect(component.customFrom).toBeTruthy();
    expect(component.customTo).toBeTruthy();
  });

  it('should initialize comparison default dates when custom comparison shortcut is selected', () => {
    component.comparisonCustomFrom = '';
    component.comparisonCustomTo = '';
    component.onComparisonShortcutChange('custom');
    expect(component.comparisonShortcut).toBe('custom');
    expect(component.comparisonCustomFrom).toBeTruthy();
    expect(component.comparisonCustomTo).toBeTruthy();
  });

  it('should show error message when custom dates are missing on loadReportData', () => {
    component.selectedShortcut = 'custom';
    component.customFrom = '';
    component.customTo = '';
    component.loadReportData();
    expect(component.errorMsg).toBe('Please select both start and end dates for the report.');
    expect(component.loading).toBe(false);
  });

  it('should show error message when custom from date is after to date', () => {
    component.selectedShortcut = 'custom';
    component.customFrom = '2026-09-30';
    component.customTo = '2026-09-28';
    component.loadReportData();
    expect(component.errorMsg).toBe('Report start date cannot be after end date.');
    expect(component.loading).toBe(false);
  });

  it('should show error message when comparison custom dates are invalid', () => {
    component.selectedShortcut = '30d';
    component.comparisonEnabled = true;
    component.comparisonShortcut = 'custom';
    component.comparisonCustomFrom = '2026-09-30';
    component.comparisonCustomTo = '2026-09-28';
    component.loadReportData();
    expect(component.errorMsg).toBe('Comparison start date cannot be after end date.');
    expect(component.loading).toBe(false);
  });

  it('should fetch report data successfully when custom dates are valid', () => {
    component.selectedShortcut = 'custom';
    component.customFrom = '2026-09-01';
    component.customTo = '2026-09-08';
    component.loadReportData();
    expect(mockAirQualityService.getHistoricalReadings).toHaveBeenCalledWith(
      expect.objectContaining({
        from: '2026-09-01',
        to: '2026-09-08'
      })
    );
    expect(component.errorMsg).toBeNull();
  });

  it('should generate report with comparison readings when comparison is enabled', () => {
    const compReadings: AirQualityReading[] = [
      {
        deviceId: 'SENSOR-001',
        time: '2026-08-01T10:00:00Z',
        pm2_5: 18.0,
        pm10: 30.0,
        pm1_0: 10.0,
        co2: 600,
        temperature: 20.0,
        humidity: 60.0
      }
    ];

    mockAirQualityService.getHistoricalReadings
      .mockReturnValueOnce(of({ readings: mockReadings }))
      .mockReturnValueOnce(of({ readings: compReadings }));

    component.comparisonEnabled = true;
    component.selectedShortcut = '30d';
    component.comparisonShortcut = '30d';
    component.loadReportData();

    expect(component.reportData).toBeTruthy();
    expect(component.reportData?.primaryReadings.length).toBe(1);
    expect(component.reportData?.comparisonReadings?.length).toBe(1);
  });
});
