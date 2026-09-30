## Context

The system tracks environmental telemetry (PM2.5, PM10, PM1.0, CO₂, Temperature, Humidity) captured by IoT monitoring stations. The dashboard already displays real-time readings and individual sensor cards. However, users lack a structured reporting workflow to analyze long-term trends, run side-by-side temporal comparisons, and extract formal PDF/Excel artifacts.

This design operationalizes the **Módulo de Reportes (Reports Module)** UML Use Case diagram into an Angular standalone architecture, incorporating the project's existing WHO stoplight threshold guidelines (`air-quality-threshold.service.ts` and `priority-and-stoplight-behavior.md`).

## Goals / Non-Goals

**Goals:**
- Provide a dedicated, responsive reporting view under `/dashboard/reports` accessible to authenticated users.
- Support flexible querying: single station selection, quick range presets (`24h`, `7d`, `30d`, `1y`), or custom date pickers.
- Render comparative analytics using an **Overlay Line Chart** to inspect primary vs. comparison periods on a synchronized time axis with dynamic $\Delta$ percentage badges.
- Display an executive KPI dashboard: average, min, max, peak timestamp, and WHO stoplight distribution (% Green, Yellow, Orange, Red).
- Provide one-click multi-format export:
  - **Excel / CSV**: Clean tabular data with metadata header and parameter summaries.
  - **PDF**: Executive printable report formatted via CSS `@media print` with company logo, summary metrics, and chart capture.
- Full bilingual i18n support in English and Spanish.

**Non-Goals:**
- Multi-station spatial aggregation across different geographical regions in a single chart (scoped to single station per report for clarity).
- Modifying backend database schemas or server-side telemetry aggregation endpoints (client-side processing on top of `GET /api/air-quality/historical` and `GET /api/sensors`).

## Architecture & Component Hierarchy

```
ReportsComponent (/dashboard/reports)
│
├── ReportFilterBarComponent
│   ├── Station Dropdown (SensorService)
│   ├── Period Preset / Custom Date Picker
│   ├── Comparison Toggle & Baseline Range Selector
│   └── "Generate Report" Action Button
│
├── ReportKpiSummaryComponent
│   ├── Primary Metric Cards (PM2.5, PM10, CO₂, Temp, Humidity)
│   ├── Comparative Delta Badges (e.g. "▼ -12.4% vs previous period")
│   └── Stoplight Compliance Banner (Worst severity & distribution)
│
├── ReportTrendChartComponent
│   ├── Pollutant Metric Selector Tab (PM2.5, PM10, CO₂, etc.)
│   ├── Chart.js Overlay Line Chart (Solid primary line + Dashed comparison line)
│   └── WHO Threshold Reference Lines
│
├── ReportDataTableComponent
│   ├── Paginated Historical Readings Table
│   ├── Severity Tagging per Row
│   └── Search / Filter by Severity Level
│
└── ReportExportMenuComponent
    ├── "Export to Excel / CSV" Action
    └── "Export to PDF / Print Report" Action
```

## Services & Data Flow

1. **`ReportCalculationService`**:
   - Accepts raw `AirQualityReading[]` arrays for primary (and optional comparison) periods.
   - Calculates summary statistics: `mean`, `min`, `max`, `standardDeviation`, `peakReading`.
   - Evaluates each reading against `AirQualityThresholdService` to compute the stoplight severity distribution (`greenCount`, `yellowCount`, `orangeCount`, `redCount`, `compliancePercentage`).
   - If comparison mode is active, synchronizes time bins (relative Day 1..N or timestamp alignment) and computes delta:
     $$\Delta\% = \frac{\text{Mean}_{\text{primary}} - \text{Mean}_{\text{comparison}}}{\text{Mean}_{\text{comparison}}} \times 100$$

2. **`ReportExportService`**:
   - **CSV / Excel Generation**: Encodes UTF-8 BOM, formats CSV structure with Station metadata, Summary KPI block, and Raw Data lines; triggers native file download.
   - **PDF Generation**: Uses browser print media formatting with dedicated `@media print` stylesheet (hiding navigation, sizing charts, inserting header/footer and page breaks) or printable DOM renderer.

## Key Design Decisions

1. **Overlay Line Chart for Period Comparison**:
   - Rather than splitting the screen with two disconnected charts, primary and comparison time series are normalized onto a shared relative time axis (e.g. Day 1, Day 2, ..., Day N) or overlaid chronologically.
   - Distinct stroke styles: Primary series in solid brand color (Sky/Indigo), comparison series in dashed muted tone (Violet/Slate).
   - Tooltips show side-by-side values and the difference at each time point.

2. **Single Station Selection Scope**:
   - Keeps telemetry signals clear and unambiguous. Station metadata (name, UID, coordinates) is prominently displayed in the report header.

3. **Client-Side Report Synthesis**:
   - Leverages `AirQualityService.getHistoricalReadings()`. This eliminates waiting for backend reporting services to deploy and allows instant, client-cached parameter recalculations.

## Risks / Trade-offs

- **Large Time Ranges (e.g. 1 Year)**: A full year of high-frequency telemetry could represent thousands of data points.
  - *Mitigation*: Client-side bucketing (daily averaging) for spans greater than 30 days before feeding into Chart.js to maintain 60fps rendering performance.
- **Print Formatting Consistency**: Print layouts can vary slightly across browsers.
  - *Mitigation*: Robust `@media print` CSS isolating the report container, forcing light theme colors, disabling background animations, and enforcing page breaks.
