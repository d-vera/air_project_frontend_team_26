## 1. Data Models & Service Layer

- [x] 1.1 Create `src/app/models/report.model.ts` defining data types for report queries, statistical summaries, comparison deltas, and export options.
- [x] 1.2 Implement `ReportCalculationService` in `src/app/features/reports/services/report-calculation.service.ts` to compute summary metrics, WHO stoplight distributions, time bucketing, and comparison deltas.
- [x] 1.3 Implement unit tests for `ReportCalculationService` covering basic stats, threshold evaluation, and edge cases.
- [x] 1.4 Implement `ReportExportService` in `src/app/features/reports/services/report-export.service.ts` supporting CSV/Excel generation and printable PDF format triggering.
- [x] 1.5 Implement unit tests for `ReportExportService`.

## 2. Report UI Components

- [x] 2.1 Create `ReportFilterBarComponent` with station picker, period shortcuts (`24h`, `7d`, `30d`, `1y`), custom date inputs, and comparison toggle.
- [x] 2.2 Create `ReportKpiSummaryComponent` displaying KPI cards (Average, Min, Max, Peak) with comparison delta badges and WHO stoplight distribution bar.
- [x] 2.3 Create `ReportTrendChartComponent` utilizing Chart.js to render overlay lines for primary and comparison series with threshold annotations.
- [x] 2.4 Create `ReportDataTableComponent` rendering paginated readings with severity badges and search/filter.
- [x] 2.5 Create `ReportExportMenuComponent` with PDF and Excel/CSV download triggers.
- [x] 2.6 Create the parent `ReportsComponent` assembling the filter bar, KPI summary, chart, table, and export actions.
- [x] 2.7 Add printable CSS `@media print` styles for clean PDF generation.
- [x] 2.8 Create unit tests for each new component.

## 3. Routing, Navigation & Localization

- [x] 3.1 Register `/dashboard/reports` route in `src/app/app.routes.ts` with `authGuard`.
- [x] 3.2 Add "Reports" navigation link in `src/app/shared/components/sidebar/sidebar.component.ts`.
- [x] 3.3 Add complete English translations in `src/assets/i18n/en.json` under `REPORTS` namespace.
- [x] 3.4 Add complete Spanish translations in `src/assets/i18n/es.json` under `REPORTS` namespace.

## 4. Verification & Validation

- [x] 4.1 Run `npm run build` and ensure error-free compilation.
- [x] 4.2 Run `npm test` and verify all tests pass.
- [x] 4.3 Verify report generation, overlay chart comparison, and PDF/Excel exports in the browser.
