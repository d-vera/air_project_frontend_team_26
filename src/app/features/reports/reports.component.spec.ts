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
});
