import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { ReportCalculationService } from './report-calculation.service';
import { AirQualityThresholdService } from '../../../core/services/air-quality-threshold.service';
import { AirQualityReading } from '../../../models/air-quality.model';
import { ReportQuery } from '../../../models/report.model';

describe('ReportCalculationService', () => {
  let service: ReportCalculationService;

  const sampleReadings: AirQualityReading[] = [
    {
      deviceId: 'SENSOR-001',
      deviceName: 'Central Station',
      time: '2026-09-01T10:00:00Z',
      temperature: 22.0,
      humidity: 45.0,
      co2: 600,
      pm1_0: 8.0,
      pm2_5: 12.0,
      pm10: 25.0
    },
    {
      deviceId: 'SENSOR-001',
      deviceName: 'Central Station',
      time: '2026-09-01T12:00:00Z',
      temperature: 26.0,
      humidity: 62.0,
      co2: 1100, // orange CO2
      pm1_0: 18.0,
      pm2_5: 42.0, // orange PM2.5
      pm10: 55.0
    },
    {
      deviceId: 'SENSOR-001',
      deviceName: 'Central Station',
      time: '2026-09-01T14:00:00Z',
      temperature: 34.0, // red Temp (>32)
      humidity: 85.0, // red Humidity (>80)
      co2: 800,
      pm1_0: 55.0, // red PM1.0 (>50)
      pm2_5: 80.0, // red PM2.5 (>75)
      pm10: 160.0 // red PM10 (>150)
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ReportCalculationService, AirQualityThresholdService]
    });
    service = TestBed.inject(ReportCalculationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('calculateStatistics', () => {
    it('should calculate accurate mean, min, max, and identify peak timestamp', () => {
      const stats = service.calculateStatistics(sampleReadings);

      expect(stats.pm2_5.mean).toBe(44.7); // (12 + 42 + 80) / 3 = 44.666 -> 44.7
      expect(stats.pm2_5.min).toBe(12.0);
      expect(stats.pm2_5.max).toBe(80.0);
      expect(stats.pm2_5.peakTimestamp).toBe('2026-09-01T14:00:00Z');
      expect(stats.pm2_5.latestValue).toBe(80.0);
      expect(stats.pm2_5.readingsCount).toBe(3);

      expect(stats.co2.mean).toBe(833.3); // (600 + 1100 + 800) / 3 = 833.33 -> 833.3
      expect(stats.co2.min).toBe(600);
      expect(stats.co2.max).toBe(1100);
      expect(stats.co2.peakTimestamp).toBe('2026-09-01T12:00:00Z');
    });

    it('should gracefully handle empty readings list', () => {
      const stats = service.calculateStatistics([]);
      expect(stats.pm2_5.mean).toBe(0);
      expect(stats.pm2_5.min).toBe(0);
      expect(stats.pm2_5.max).toBe(0);
      expect(stats.pm2_5.readingsCount).toBe(0);
    });
  });

  describe('calculateStoplightDistribution & worstSeverity', () => {
    it('should calculate stoplight distribution and worst severity', () => {
      const dist = service.calculateStoplightDistribution(sampleReadings);
      // Reading 1: All green -> Green
      // Reading 2: CO2 & PM2.5 orange -> Orange
      // Reading 3: PM2.5, PM10, etc. red -> Red
      expect(dist.totalCount).toBe(3);
      expect(dist.greenCount).toBe(1);
      expect(dist.yellowCount).toBe(0);
      expect(dist.orangeCount).toBe(1);
      expect(dist.redCount).toBe(1);
      expect(dist.complianceRate).toBe(33.3); // 1 / 3 = 33.3%

      const worst = service.calculateWorstSeverity(sampleReadings);
      expect(worst).toBe('red');
    });

    it('should return 100% compliance and green worst severity for empty readings', () => {
      const dist = service.calculateStoplightDistribution([]);
      expect(dist.complianceRate).toBe(100);
      expect(dist.totalCount).toBe(0);

      const worst = service.calculateWorstSeverity([]);
      expect(worst).toBe('green');
    });
  });

  describe('calculateComparisonDeltas', () => {
    it('should correctly calculate delta metrics and improvement flags', () => {
      const primaryStats = service.calculateStatistics(sampleReadings);
      const comparisonReadings: AirQualityReading[] = [
        {
          deviceId: 'SENSOR-001',
          time: '2026-08-01T10:00:00Z',
          temperature: 20.0,
          humidity: 50.0,
          co2: 1200,
          pm1_0: 20.0,
          pm2_5: 60.0,
          pm10: 80.0
        }
      ];
      const comparisonStats = service.calculateStatistics(comparisonReadings);

      const deltas = service.calculateComparisonDeltas(primaryStats, comparisonStats);

      // PM2.5 primary: 44.7, comparison: 60.0
      // delta = 44.7 - 60.0 = -15.3
      // reduction is an improvement!
      expect(deltas.pm2_5.deltaAbsolute).toBe(-15.3);
      expect(deltas.pm2_5.isImprovement).toBe(true);
      expect(deltas.pm2_5.deltaPercentage).toBeCloseTo(-25.5, 1);
    });

    it('should handle zero comparison mean without division by zero errors', () => {
      const primaryStats = service.calculateStatistics(sampleReadings);
      const emptyStats = service.calculateStatistics([]);
      const deltas = service.calculateComparisonDeltas(primaryStats, emptyStats);

      expect(deltas.pm2_5.deltaPercentage).toBe(0);
      expect(deltas.pm2_5.deltaAbsolute).toBe(44.7);
    });
  });

  describe('prepareOverlaySeries', () => {
    it('should format points for primary and comparison series', () => {
      const compReadings: AirQualityReading[] = [sampleReadings[0]];
      const series = service.prepareOverlaySeries(sampleReadings, compReadings, 'pm2_5');

      expect(series.parameter).toBe('pm2_5');
      expect(series.unit).toBe('µg/m³');
      expect(series.primaryPoints.length).toBe(3);
      expect(series.comparisonPoints?.length).toBe(1);
      expect(series.primaryPoints[0].value).toBe(12.0);
    });
  });

  describe('generateReportData', () => {
    it('should assemble a complete ReportData object', () => {
      const query: ReportQuery = {
        deviceId: 'SENSOR-001',
        deviceName: 'Central Patio',
        rangeShortcut: '30d',
        comparisonEnabled: true,
        comparisonRangeShortcut: '30d'
      };

      const result = service.generateReportData(query, sampleReadings, [sampleReadings[0]]);

      expect(result.stationName).toBe('Central Patio');
      expect(result.stationUid).toBe('SENSOR-001');
      expect(result.primaryPeriodLabel).toBe('Last 30 Days');
      expect(result.comparisonPeriodLabel).toBe('Last 30 Days');
      expect(result.statistics.pm2_5).toBeDefined();
      expect(result.deltas).toBeDefined();
      expect(result.stoplightDistribution.totalCount).toBe(3);
      expect(result.worstSeverity).toBe('red');
    });
  });
});
