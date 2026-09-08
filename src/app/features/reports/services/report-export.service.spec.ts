import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ReportExportService } from './report-export.service';
import { ReportData } from '../../../models/report.model';

describe('ReportExportService', () => {
  let service: ReportExportService;

  const mockReport: ReportData = {
    query: {
      deviceId: 'SENSOR-001',
      deviceName: 'Patio Central',
      rangeShortcut: '30d',
      comparisonEnabled: false
    },
    generatedAt: '2026-09-08T12:00:00Z',
    stationName: 'Patio Central',
    stationUid: 'SENSOR-001',
    primaryPeriodLabel: 'Last 30 Days',
    primaryReadings: [
      {
        deviceId: 'SENSOR-001',
        deviceName: 'Patio Central',
        time: '2026-09-08T10:00:00Z',
        pm2_5: 14.5,
        pm10: 25.0,
        pm1_0: 8.0,
        co2: 450,
        temperature: 22.5,
        humidity: 50.0
      }
    ],
    statistics: {
      pm2_5: {
        parameter: 'pm2_5',
        label: 'PM 2.5',
        unit: 'µg/m³',
        mean: 14.5,
        min: 14.5,
        max: 14.5,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 14.5,
        readingsCount: 1
      },
      pm10: {
        parameter: 'pm10',
        label: 'PM 10',
        unit: 'µg/m³',
        mean: 25.0,
        min: 25.0,
        max: 25.0,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 25.0,
        readingsCount: 1
      },
      co2: {
        parameter: 'co2',
        label: 'CO₂',
        unit: 'ppm',
        mean: 450,
        min: 450,
        max: 450,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 450,
        readingsCount: 1
      },
      pm1_0: {
        parameter: 'pm1_0',
        label: 'PM 1.0',
        unit: 'µg/m³',
        mean: 8.0,
        min: 8.0,
        max: 8.0,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 8.0,
        readingsCount: 1
      },
      temperature: {
        parameter: 'temperature',
        label: 'Temperature',
        unit: '°C',
        mean: 22.5,
        min: 22.5,
        max: 22.5,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 22.5,
        readingsCount: 1
      },
      humidity: {
        parameter: 'humidity',
        label: 'Humidity',
        unit: '%',
        mean: 50.0,
        min: 50.0,
        max: 50.0,
        peakTimestamp: '2026-09-08T10:00:00Z',
        latestValue: 50.0,
        readingsCount: 1
      }
    },
    stoplightDistribution: {
      greenCount: 1,
      yellowCount: 0,
      orangeCount: 0,
      redCount: 0,
      totalCount: 1,
      complianceRate: 100
    },
    worstSeverity: 'green'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportExportService]
    });
    service = TestBed.inject(ReportExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('generateCsvContent', () => {
    it('should generate properly formatted CSV content with all sections', () => {
      const csv = service.generateCsvContent(mockReport);

      expect(csv).toContain('--- ENVIRONMENTAL MONITORING REPORT ---');
      expect(csv).toContain('Station Name,Patio Central');
      expect(csv).toContain('Station UID,SENSOR-001');
      expect(csv).toContain('--- PARAMETER SUMMARY STATISTICS ---');
      expect(csv).toContain('PM 2.5,µg/m³,14.5,14.5,14.5');
      expect(csv).toContain('--- WHO STOPLIGHT COMPLIANCE ---');
      expect(csv).toContain('Compliance Rate (Optimal + Acceptable),100%');
      expect(csv).toContain('--- RAW TELEMETRY READINGS ---');
      expect(csv).toContain('2026-09-08T10:00:00Z,SENSOR-001,14.5,25,8,450,22.5,50');
    });

    it('should include comparison deltas when deltas are present', () => {
      const reportWithDeltas: ReportData = {
        ...mockReport,
        comparisonPeriodLabel: 'Previous 30 Days',
        deltas: {
          pm2_5: {
            parameter: 'pm2_5',
            label: 'PM 2.5',
            unit: 'µg/m³',
            primaryMean: 14.5,
            comparisonMean: 18.0,
            deltaAbsolute: -3.5,
            deltaPercentage: -19.4,
            isImprovement: true
          },
          pm10: { parameter: 'pm10', label: 'PM 10', unit: 'µg/m³', primaryMean: 25, comparisonMean: 25, deltaAbsolute: 0, deltaPercentage: 0, isImprovement: false },
          co2: { parameter: 'co2', label: 'CO₂', unit: 'ppm', primaryMean: 450, comparisonMean: 450, deltaAbsolute: 0, deltaPercentage: 0, isImprovement: false },
          pm1_0: { parameter: 'pm1_0', label: 'PM 1.0', unit: 'µg/m³', primaryMean: 8, comparisonMean: 8, deltaAbsolute: 0, deltaPercentage: 0, isImprovement: false },
          temperature: { parameter: 'temperature', label: 'Temperature', unit: '°C', primaryMean: 22.5, comparisonMean: 22.5, deltaAbsolute: 0, deltaPercentage: 0, isImprovement: false },
          humidity: { parameter: 'humidity', label: 'Humidity', unit: '%', primaryMean: 50, comparisonMean: 50, deltaAbsolute: 0, deltaPercentage: 0, isImprovement: false }
        }
      };

      const csv = service.generateCsvContent(reportWithDeltas);
      expect(csv).toContain('Comparison Period,Previous 30 Days');
      expect(csv).toContain('Comparison Mean,Delta Abs,Delta %,Improvement?');
      expect(csv).toContain('18,-3.5,-19.4%,YES');
    });
  });

  describe('triggerPrintPdf', () => {
    it('should call window.print when triggered', () => {
      const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
      service.triggerPrintPdf();
      expect(printSpy).toHaveBeenCalled();
      printSpy.mockRestore();
    });
  });
});
