# environmental-reports Specification

## Purpose
Provide registered users and administrators with an environmental reporting module to request historical data for monitoring stations, compare air quality trends across periods using overlay visualizations, inspect WHO stoplight compliance rates, and export structured PDF and Excel/CSV reports.

## Requirements

### Requirement: Request Environmental Report Configuration
The system SHALL provide a report configuration bar allowing authenticated users to select a monitoring station and a time period to request environmental telemetry.

#### Scenario: Select station
- **WHEN** the user opens the station selector
- **THEN** the system lists all active monitoring stations with station name and UID, defaulting to the first available station or user preference

#### Scenario: Select time period shortcut
- **WHEN** the user selects a range shortcut (`24h`, `7d`, `30d`, `1y`)
- **THEN** the system calculates the corresponding start and end timestamps and enables report generation

#### Scenario: Select custom date range
- **WHEN** the user selects the "Custom" range option
- **THEN** the system presents "From" and "To" date inputs, validating that "From" is earlier than or equal to "To"

---

### Requirement: Period Comparison with Overlay Visualization
The system SHALL allow users to enable a comparison mode to compare the primary period with a baseline period for the selected station, displaying both time-series on an overlay line chart.

#### Scenario: Enable period comparison
- **WHEN** the user toggles "Compare Periods"
- **THEN** the system reveals a comparison period selector (e.g., "Previous Period of Same Length" or custom range)

#### Scenario: Render overlay line chart
- **WHEN** report data is loaded with comparison enabled
- **THEN** the chart plots the primary period as a solid line and the comparison period as a dashed line on a synchronized time axis

#### Scenario: Display comparative delta metrics
- **WHEN** comparison data is generated
- **THEN** the system displays percentage delta indicators ($\Delta\%$) for key pollutants indicating whether air quality improved or worsened compared to baseline

---

### Requirement: View Executive Report & Analyze Pollution Trends
The system SHALL render an interactive report view containing summary KPI cards, WHO stoplight compliance rates, pollution trend curves, and a paginated historical log.

#### Scenario: Executive KPI summary display
- **WHEN** a report is generated
- **THEN** the system displays average, maximum, minimum, and peak exposure timestamps for PM2.5, PM10, CO₂, Temperature, and Humidity

#### Scenario: WHO stoplight compliance evaluation
- **WHEN** a report is generated
- **THEN** the system evaluates all readings against WHO guidelines and displays the percentage of time spent in Green, Yellow, Orange, and Red status

#### Scenario: Detailed readings log
- **WHEN** viewing the report data table
- **THEN** the system displays timestamped readings with color-coded severity badges and allows pagination through the records

---

### Requirement: Multi-format Report Export (PDF & Excel/CSV)
The system SHALL provide actions to export the generated environmental report in PDF format and Excel/CSV format.

#### Scenario: Export report to Excel / CSV
- **WHEN** the user clicks "Export to Excel" (or CSV)
- **THEN** the browser downloads a `.csv` or `.xlsx` file containing report metadata header, KPI statistical summary, and complete raw readings

#### Scenario: Export report to PDF / Print view
- **WHEN** the user clicks "Export to PDF"
- **THEN** the system opens an executive print preview layout optimized for standard A4/Letter paper with headers, KPIs, chart snapshots, and no navigation chrome

---

### Requirement: Access Control & Internationalization
The system SHALL restrict access to authenticated users (`authGuard`) and support both English and Spanish language switching.

#### Scenario: Unauthenticated access attempt
- **WHEN** an unauthenticated user navigates directly to `/dashboard/reports`
- **THEN** the system redirects the user to `/login`

#### Scenario: Bilingual display
- **WHEN** the user changes the interface language between English and Spanish
- **THEN** all report labels, metrics, chart axes, tooltips, and export metadata update dynamically to the selected language
