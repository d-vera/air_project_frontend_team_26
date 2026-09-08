## Why

Environmental monitoring requires retrospective and comparative analysis of air quality telemetry beyond real-time alerts. Registered users and administrators need a dedicated **Environmental Reports Module** to evaluate historical pollution trends, compare air quality across distinct time periods, assess WHO stoplight compliance rates, and export findings in executive formats (PDF and Excel/CSV) for environmental audits and stakeholder reporting.

## What Changes

- Introduce a new authenticated route `/dashboard/reports` protected by `authGuard`, accessible to both Registered Users and Administrators.
- Add a "Reports" navigation entry in the application sidebar with localized labels (`en` and `es`).
- Implement the **Request Environmental Report** workflow:
  - **Station Selector**: Single-station picker populated with active sensors via `SensorService`.
  - **Time Period Selector**: Preset shortcuts (`24h`, `7d`, `30d`, `1y`) and custom date ranges (`from` / `to`).
  - **Historical Query Engine**: Integrates with `AirQualityService.getHistoricalReadings()`.
- Implement **Period Comparison (`Comparar periodos`)**:
  - Compare primary period against a preceding or custom baseline period.
  - Render an **Overlay Line Chart** aligning both periods on a normalized timeline.
  - Calculate comparative metrics ($\Delta$ average, $\Delta$ peak, pollution reduction/increase percentage).
- Implement **Report Visualization & Trend Analysis (`Visualizar reporte` & `Analizar tendencias`)**:
  - Executive KPI summary cards (Average PM2.5, PM10, CO₂, Temperature, Humidity).
  - Peak pollution exposure windows (time of peak, max value).
  - WHO Stoplight compliance breakdown (percentage of time in Green, Yellow, Orange, Red zones).
  - Paginated reading log with severity badges and threshold exceedance tags.
- Implement **Download Report (`Descargar reporte`)**:
  - **Export PDF (`Exportar reporte en PDF`)**: Clean, print-optimized executive summary document.
  - **Export Excel / CSV (`Exportar reporte en Excel`)**: Downloadable structured dataset containing report metadata, statistical summary, and timestamped readings.
- Provide full bilingual localization (`en` and `es`) for all reporting terminology, chart labels, export headers, and error states.

## Capabilities

### New Capabilities
- `environmental-reports`: Provides end-to-end report configuration, time-series historical analysis, period comparison with overlay visualization, WHO compliance statistics, and multi-format export (PDF and Excel/CSV).

### Modified Capabilities
<!-- None -->

## Impact

- **Routing**: `src/app/app.routes.ts` — add `/dashboard/reports` child route with `authGuard`.
- **Navigation**: `src/app/shared/components/sidebar/sidebar.component.ts` — add Reports link with icon and translation keys.
- **Feature Module**: `src/app/features/reports/` — new standalone component, subcomponents (filter bar, KPI cards, overlay chart, data table, export menu), and support services (calculation and export).
- **Models**: `src/app/models/report.model.ts` — data types for report parameters, KPI summaries, comparison delta, and export payloads.
- **Localization**: `src/assets/i18n/en.json` and `src/assets/i18n/es.json` — complete translation keys for reports module.
- **Specs**: New specification `openspec/changes/environmental-reports/specs/environmental-reports/spec.md`.
