import { AirQualityReading, TimeRangeShortcut } from './air-quality.model';
import { StoplightStatus } from '../core/services/air-quality-threshold.service';

export type ReportParameter = 'pm2_5' | 'pm10' | 'co2' | 'pm1_0' | 'temperature' | 'humidity';

export interface ParameterMetadata {
  key: ReportParameter;
  label: string;
  unit: string;
  translationKey: string;
}

export const REPORT_PARAMETERS: ParameterMetadata[] = [
  { key: 'pm2_5', label: 'PM 2.5', unit: 'µg/m³', translationKey: 'REPORTS.PARAMS.PM2_5' },
  { key: 'pm10', label: 'PM 10', unit: 'µg/m³', translationKey: 'REPORTS.PARAMS.PM10' },
  { key: 'co2', label: 'CO₂', unit: 'ppm', translationKey: 'REPORTS.PARAMS.CO2' },
  { key: 'pm1_0', label: 'PM 1.0', unit: 'µg/m³', translationKey: 'REPORTS.PARAMS.PM1_0' },
  { key: 'temperature', label: 'Temperature', unit: '°C', translationKey: 'REPORTS.PARAMS.TEMPERATURE' },
  { key: 'humidity', label: 'Humidity', unit: '%', translationKey: 'REPORTS.PARAMS.HUMIDITY' }
];

export interface ReportQuery {
  deviceId: string;
  deviceName?: string;
  rangeShortcut: TimeRangeShortcut;
  from?: string;
  to?: string;
  comparisonEnabled: boolean;
  comparisonRangeShortcut?: TimeRangeShortcut;
  comparisonFrom?: string;
  comparisonTo?: string;
}

export interface ParameterStatistic {
  parameter: ReportParameter;
  label: string;
  unit: string;
  mean: number;
  min: number;
  max: number;
  peakTimestamp: string;
  latestValue: number;
  readingsCount: number;
}

export interface ComparisonDelta {
  parameter: ReportParameter;
  label: string;
  unit: string;
  primaryMean: number;
  comparisonMean: number;
  deltaAbsolute: number;
  deltaPercentage: number;
  isImprovement: boolean;
}

export interface StoplightDistribution {
  greenCount: number;
  yellowCount: number;
  orangeCount: number;
  redCount: number;
  totalCount: number;
  complianceRate: number; // Percentage of readings in Green or Yellow (optimal / acceptable)
}

export interface TimeSeriesPoint {
  timestamp: string;
  label: string; // e.g. "2026-09-08 14:00" or "Day 1"
  value: number;
}

export interface OverlayTimeSeries {
  parameter: ReportParameter;
  unit: string;
  primaryPoints: TimeSeriesPoint[];
  comparisonPoints?: TimeSeriesPoint[];
}

export interface ReportData {
  query: ReportQuery;
  generatedAt: string;
  stationName: string;
  stationUid: string;
  primaryPeriodLabel: string;
  comparisonPeriodLabel?: string;
  primaryReadings: AirQualityReading[];
  comparisonReadings?: AirQualityReading[];
  statistics: Record<ReportParameter, ParameterStatistic>;
  deltas?: Record<ReportParameter, ComparisonDelta>;
  stoplightDistribution: StoplightDistribution;
  worstSeverity: StoplightStatus;
}

export type ExportFormat = 'excel' | 'csv' | 'pdf';
