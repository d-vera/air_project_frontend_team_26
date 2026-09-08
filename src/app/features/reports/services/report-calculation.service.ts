import { Injectable, inject } from '@angular/core';
import { AirQualityReading } from '../../../models/air-quality.model';
import {
  ComparisonDelta,
  OverlayTimeSeries,
  ParameterStatistic,
  REPORT_PARAMETERS,
  ReportData,
  ReportParameter,
  ReportQuery,
  StoplightDistribution,
  TimeSeriesPoint
} from '../../../models/report.model';
import { AirQualityThresholdService, StoplightStatus } from '../../../core/services/air-quality-threshold.service';

@Injectable({
  providedIn: 'root'
})
export class ReportCalculationService {
  private thresholdService = inject(AirQualityThresholdService);

  /**
   * Calculates descriptive statistics (mean, min, max, peak timestamp, latest)
   * for each supported environmental parameter.
   */
  calculateStatistics(readings: AirQualityReading[]): Record<ReportParameter, ParameterStatistic> {
    const stats = {} as Record<ReportParameter, ParameterStatistic>;

    for (const meta of REPORT_PARAMETERS) {
      const param = meta.key;
      const validReadings = readings.filter(r => r[param] != null && !isNaN(Number(r[param])));

      if (validReadings.length === 0) {
        stats[param] = {
          parameter: param,
          label: meta.label,
          unit: meta.unit,
          mean: 0,
          min: 0,
          max: 0,
          peakTimestamp: '',
          latestValue: 0,
          readingsCount: 0
        };
        continue;
      }

      let sum = 0;
      let min = Number.POSITIVE_INFINITY;
      let max = Number.NEGATIVE_INFINITY;
      let peakTimestamp = validReadings[0].time;

      for (const r of validReadings) {
        const val = Number(r[param]);
        sum += val;
        if (val < min) {
          min = val;
        }
        if (val > max) {
          max = val;
          peakTimestamp = r.time;
        }
      }

      const mean = Math.round((sum / validReadings.length) * 10) / 10;
      const sortedByTime = [...validReadings].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const latestValue = Number(sortedByTime[sortedByTime.length - 1][param]);

      stats[param] = {
        parameter: param,
        label: meta.label,
        unit: meta.unit,
        mean,
        min: Math.round(min * 10) / 10,
        max: Math.round(max * 10) / 10,
        peakTimestamp,
        latestValue: Math.round(latestValue * 10) / 10,
        readingsCount: validReadings.length
      };
    }

    return stats;
  }

  /**
   * Evaluates WHO stoplight status across all readings in the series
   * and aggregates counts and compliance percentage.
   */
  calculateStoplightDistribution(readings: AirQualityReading[]): StoplightDistribution {
    if (!readings || readings.length === 0) {
      return {
        greenCount: 0,
        yellowCount: 0,
        orangeCount: 0,
        redCount: 0,
        totalCount: 0,
        complianceRate: 100
      };
    }

    let green = 0;
    let yellow = 0;
    let orange = 0;
    let red = 0;

    for (const r of readings) {
      const status = this.thresholdService.getOverallStatus(r);
      switch (status) {
        case 'green': green++; break;
        case 'yellow': yellow++; break;
        case 'orange': orange++; break;
        case 'red': red++; break;
      }
    }

    const total = readings.length;
    // Optimal (Green) or Acceptable (Yellow) compliance
    const compliant = green + yellow;
    const complianceRate = Math.round((compliant / total) * 1000) / 10;

    return {
      greenCount: green,
      yellowCount: yellow,
      orangeCount: orange,
      redCount: red,
      totalCount: total,
      complianceRate
    };
  }

  /**
   * Determine the worst severity present across all readings.
   */
  calculateWorstSeverity(readings: AirQualityReading[]): StoplightStatus {
    if (!readings || readings.length === 0) {
      return 'green';
    }

    let hasRed = false;
    let hasOrange = false;
    let hasYellow = false;

    for (const r of readings) {
      const status = this.thresholdService.getOverallStatus(r);
      if (status === 'red') {
        return 'red';
      }
      if (status === 'orange') hasOrange = true;
      if (status === 'yellow') hasYellow = true;
    }

    if (hasOrange) return 'orange';
    if (hasYellow) return 'yellow';
    return 'green';
  }

  /**
   * Computes comparison deltas (absolute difference, percentage change, and improvement indicator)
   * between the primary period statistics and the comparison period statistics.
   */
  calculateComparisonDeltas(
    primaryStats: Record<ReportParameter, ParameterStatistic>,
    comparisonStats: Record<ReportParameter, ParameterStatistic>
  ): Record<ReportParameter, ComparisonDelta> {
    const deltas = {} as Record<ReportParameter, ComparisonDelta>;

    for (const meta of REPORT_PARAMETERS) {
      const param = meta.key;
      const p = primaryStats[param];
      const c = comparisonStats[param];

      const pMean = p ? p.mean : 0;
      const cMean = c ? c.mean : 0;

      const deltaAbsolute = Math.round((pMean - cMean) * 10) / 10;
      let deltaPercentage = 0;
      if (cMean !== 0) {
        deltaPercentage = Math.round(((pMean - cMean) / cMean) * 1000) / 10;
      }

      // Check whether this delta is an improvement:
      let isImprovement = false;
      if (param === 'pm2_5' || param === 'pm10' || param === 'pm1_0' || param === 'co2') {
        // For airborne contaminants: decrease is an improvement
        isImprovement = deltaAbsolute < 0;
      } else if (param === 'temperature') {
        // Optimal comfort temperature is ~21°C
        isImprovement = Math.abs(pMean - 21) <= Math.abs(cMean - 21);
      } else if (param === 'humidity') {
        // Optimal humidity is ~45%
        isImprovement = Math.abs(pMean - 45) <= Math.abs(cMean - 45);
      }

      deltas[param] = {
        parameter: param,
        label: meta.label,
        unit: meta.unit,
        primaryMean: pMean,
        comparisonMean: cMean,
        deltaAbsolute,
        deltaPercentage,
        isImprovement
      };
    }

    return deltas;
  }

  /**
   * Prepares the time series data for overlay chart visualization.
   */
  prepareOverlaySeries(
    primaryReadings: AirQualityReading[],
    comparisonReadings: AirQualityReading[] | undefined,
    parameter: ReportParameter
  ): OverlayTimeSeries {
    const meta = REPORT_PARAMETERS.find(p => p.key === parameter) || REPORT_PARAMETERS[0];

    const sortedPrimary = [...primaryReadings].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    const primaryPoints: TimeSeriesPoint[] = sortedPrimary.map(r => ({
      timestamp: r.time,
      label: this.formatPointLabel(r.time),
      value: Number(r[parameter]) || 0
    }));

    let comparisonPoints: TimeSeriesPoint[] | undefined;
    if (comparisonReadings && comparisonReadings.length > 0) {
      const sortedComp = [...comparisonReadings].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      comparisonPoints = sortedComp.map(r => ({
        timestamp: r.time,
        label: this.formatPointLabel(r.time),
        value: Number(r[parameter]) || 0
      }));
    }

    return {
      parameter,
      unit: meta.unit,
      primaryPoints,
      comparisonPoints
    };
  }

  /**
   * Orchestrates the complete report generation data object.
   */
  generateReportData(
    query: ReportQuery,
    primaryReadings: AirQualityReading[],
    comparisonReadings?: AirQualityReading[]
  ): ReportData {
    const statistics = this.calculateStatistics(primaryReadings);
    const stoplightDistribution = this.calculateStoplightDistribution(primaryReadings);
    const worstSeverity = this.calculateWorstSeverity(primaryReadings);

    let deltas: Record<ReportParameter, ComparisonDelta> | undefined;
    if (query.comparisonEnabled && comparisonReadings && comparisonReadings.length > 0) {
      const comparisonStats = this.calculateStatistics(comparisonReadings);
      deltas = this.calculateComparisonDeltas(statistics, comparisonStats);
    }

    const primaryPeriodLabel = this.formatPeriodLabel(query.rangeShortcut, query.from, query.to);
    const comparisonPeriodLabel = query.comparisonEnabled
      ? this.formatPeriodLabel(query.comparisonRangeShortcut || '30d', query.comparisonFrom, query.comparisonTo)
      : undefined;

    return {
      query,
      generatedAt: new Date().toISOString(),
      stationName: query.deviceName || query.deviceId,
      stationUid: query.deviceId,
      primaryPeriodLabel,
      comparisonPeriodLabel,
      primaryReadings,
      comparisonReadings: query.comparisonEnabled ? comparisonReadings : undefined,
      statistics,
      deltas,
      stoplightDistribution,
      worstSeverity
    };
  }

  private formatPointLabel(isoString: string): string {
    try {
      const d = new Date(isoString);
      return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    } catch {
      return isoString;
    }
  }

  private formatPeriodLabel(shortcut: string, from?: string, to?: string): string {
    if (shortcut === 'custom' && from && to) {
      return `${from} to ${to}`;
    }
    const map: Record<string, string> = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '1y': 'Last 1 Year'
    };
    return map[shortcut] || shortcut;
  }
}
