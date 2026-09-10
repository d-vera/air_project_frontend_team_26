import { Injectable } from '@angular/core';
import { REPORT_PARAMETERS, ReportData } from '../../../models/report.model';

@Injectable({
  providedIn: 'root'
})
export class ReportExportService {

  /**
   * Generates a structured CSV content string from the report data.
   * Includes metadata, KPI summary statistics, WHO stoplight compliance,
   * and the complete readings log.
   */
  generateCsvContent(report: ReportData): string {
    const lines: string[] = [];

    // ── Metadata Block ──
    lines.push('--- ENVIRONMENTAL MONITORING REPORT ---');
    lines.push(`Station Name,${this.escapeCsv(report.stationName)}`);
    lines.push(`Station UID,${this.escapeCsv(report.stationUid)}`);
    lines.push(`Report Generated At,${this.escapeCsv(report.generatedAt)}`);
    lines.push(`Primary Period,${this.escapeCsv(report.primaryPeriodLabel)}`);
    if (report.comparisonPeriodLabel) {
      lines.push(`Comparison Period,${this.escapeCsv(report.comparisonPeriodLabel)}`);
    }
    lines.push('');

    // ── Executive KPI Summary Block ──
    lines.push('--- PARAMETER SUMMARY STATISTICS ---');
    if (report.deltas) {
      lines.push('Parameter,Unit,Mean,Min,Max,Peak Timestamp,Comparison Mean,Delta Abs,Delta %,Improvement?');
      for (const meta of REPORT_PARAMETERS) {
        const stat = report.statistics[meta.key];
        const delta = report.deltas[meta.key];
        lines.push([
          this.escapeCsv(meta.label),
          this.escapeCsv(meta.unit),
          stat ? stat.mean : 0,
          stat ? stat.min : 0,
          stat ? stat.max : 0,
          stat ? this.escapeCsv(stat.peakTimestamp) : '',
          delta ? delta.comparisonMean : 0,
          delta ? delta.deltaAbsolute : 0,
          delta ? `${delta.deltaPercentage}%` : '0%',
          delta ? (delta.isImprovement ? 'YES' : 'NO') : 'N/A'
        ].join(','));
      }
    } else {
      lines.push('Parameter,Unit,Mean,Min,Max,Peak Timestamp,Latest Reading');
      for (const meta of REPORT_PARAMETERS) {
        const stat = report.statistics[meta.key];
        lines.push([
          this.escapeCsv(meta.label),
          this.escapeCsv(meta.unit),
          stat ? stat.mean : 0,
          stat ? stat.min : 0,
          stat ? stat.max : 0,
          stat ? this.escapeCsv(stat.peakTimestamp) : '',
          stat ? stat.latestValue : 0
        ].join(','));
      }
    }
    lines.push('');

    // ── WHO Stoplight Compliance Block ──
    lines.push('--- WHO STOPLIGHT COMPLIANCE ---');
    const dist = report.stoplightDistribution;
    lines.push(`Optimal / Green Readings,${dist.greenCount}`);
    lines.push(`Moderate / Yellow Readings,${dist.yellowCount}`);
    lines.push(`Unhealthy / Orange Readings,${dist.orangeCount}`);
    lines.push(`Critical / Red Readings,${dist.redCount}`);
    lines.push(`Total Readings Evaluated,${dist.totalCount}`);
    lines.push(`Compliance Rate (Optimal + Acceptable),${dist.complianceRate}%`);
    lines.push(`Overall Worst Severity,${report.worstSeverity.toUpperCase()}`);
    lines.push('');

    // ── Raw Telemetry Data Block ──
    lines.push('--- RAW TELEMETRY READINGS ---');
    const hasComp = !!(report.comparisonReadings && report.comparisonReadings.length > 0);
    if (hasComp) {
      lines.push('Timestamp,Period,Device ID,PM2.5 (µg/m³),PM10 (µg/m³),PM1.0 (µg/m³),CO2 (ppm),Temperature (°C),Humidity (%)');

      const primLabel = report.primaryPeriodLabel || 'Primary';
      const compLabel = report.comparisonPeriodLabel || 'Comparison';

      const mergedList = [
        ...report.primaryReadings.map(r => ({ reading: r, period: primLabel })),
        ...report.comparisonReadings!.map(r => ({ reading: r, period: compLabel }))
      ].sort((a, b) => new Date(a.reading.time).getTime() - new Date(b.reading.time).getTime());

      for (const item of mergedList) {
        const r = item.reading;
        lines.push([
          this.escapeCsv(r.time),
          this.escapeCsv(item.period),
          this.escapeCsv(r.deviceId),
          r.pm2_5 ?? '',
          r.pm10 ?? '',
          r.pm1_0 ?? '',
          r.co2 ?? '',
          r.temperature ?? '',
          r.humidity ?? ''
        ].join(','));
      }
    } else {
      lines.push('Timestamp,Device ID,PM2.5 (µg/m³),PM10 (µg/m³),PM1.0 (µg/m³),CO2 (ppm),Temperature (°C),Humidity (%)');

      for (const r of report.primaryReadings) {
        lines.push([
          this.escapeCsv(r.time),
          this.escapeCsv(r.deviceId),
          r.pm2_5 ?? '',
          r.pm10 ?? '',
          r.pm1_0 ?? '',
          r.co2 ?? '',
          r.temperature ?? '',
          r.humidity ?? ''
        ].join(','));
      }
    }

    return lines.join('\r\n');
  }

  /**
   * Generates and downloads a CSV file with UTF-8 BOM so Excel opens accents
   * and special characters (like µg/m³) properly.
   */
  exportToCsv(report: ReportData, filenamePrefix = 'environmental-report'): void {
    const csvContent = this.generateCsvContent(report);
    // \uFEFF is UTF-8 Byte Order Mark
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const filename = `${filenamePrefix}-${report.stationUid}-${new Date().toISOString().slice(0, 10)}.csv`;
    this.downloadBlob(blob, filename);
  }

  /**
   * Alias for Excel download using UTF-8 CSV recognized natively by Excel.
   */
  exportToExcel(report: ReportData): void {
    this.exportToCsv(report, 'environmental-report-excel');
  }

  /**
   * Invokes the browser print dialog. When accompanied by print CSS styles,
   * this generates a clean, styled PDF document.
   */
  triggerPrintPdf(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  private escapeCsv(value: string | undefined | null): string {
    if (value == null) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    if (typeof document === 'undefined') return;

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
