## Context

The Angular frontend application (`air-project-frontend`) currently features authentication, theme management, and admin user management. This design addresses adding the primary **Air Quality Dashboard**, visualizing real-time environment metrics (Temperature, Humidity, CO2, PM1.0, PM2.5, PM10) and interactive historical trend graphs, governed by Role-Based Access Control (RBAC).

## Goals / Non-Goals

**Goals:**
- Implement `AirQualityService` for fetching current (`/api/air-quality/current`) and historical readings.
- Render real-time metric cards with unit indicators and device filter dropdown.
- Integrate Chart.js for interactive line/bar charting of historical environmental metrics.
- Implement time range shortcuts (**24h**, **7d**, **30d**, **1y**) and Custom Date Range (`From`/`To`).
- Enforce RBAC: Unauthenticated visitors can view real-time data and short-term trends (24h, 7d, 30d), but are prompted to log in if attempting to select **1y** or Custom Date Range.
- Dynamically format x-axis timeline labels according to the query range duration.

**Non-Goals:**
- Geographic Map Visualization (explicitly deferred).
- Alerts & Push Notifications module (explicitly deferred).

## Decisions

### 1. Data Visualization Engine: Chart.js Canvas Integration
- **Decision**: Use `Chart.js` directly with standard HTML5 `<canvas>` elements wrapped inside Angular standalone components.
- **Rationale**: Tree-shakable import of required controllers/scales (`LineController`, `BarController`, `CategoryScale`, `LinearScale`, `PointElement`, `LineElement`, `Tooltip`, `Legend`) ensures minimal bundle footprint without relying on heavy or unmaintained wrappers.
- **Alternatives Considered**: `ngx-charts` (requires D3 dependency chain), `apexcharts` (larger bundle footprint).

### 2. Angular Signal-Based State Management
- **Decision**: Manage dashboard state using Angular Signals in `AirQualityService` / `DashboardComponent`.
- **State Properties**:
  - `currentReadings`: Signal list of device readings.
  - `selectedDeviceId`: Signal string or `null` (for all devices).
  - `activeRangeShortcut`: Signal (`'24h' | '7d' | '30d' | '1y' | 'custom'`).
  - `customDateRange`: Signal `{ from: string, to: string }`.
- **Rationale**: Clean, modern Angular 22 reactivity with automatic component template updates and optimal change detection performance.

### 3. Visitor RBAC Interaction Design
- **Decision**: Keep the **1 Year** shortcut and **Custom Date Range** controls visible to unauthenticated visitors but display a lock icon (🔒). Clicking a locked option triggers a login modal (`AuthModalComponent` or notification) offering quick login or registration.
- **Rationale**: Promotes feature discovery and seamless user onboarding compared to silently hiding the options.

### 4. Router Guard Adjustment
- **Decision**: Update `app.routes.ts` so `/dashboard` is accessible publicly without triggering `authGuard` redirect for unauthenticated visitors. Protect profile and admin routes independently.

### 5. Automatic Interval Selection & Dynamic Timeline Formatting
- **Decision**: Aggregation intervals are determined automatically based on query range duration, with the frontend dynamically formatting x-axis labels (`formatTimeLabel`).
- **Interval & Format Rules**:
  - `≤ 1 day`: 10-minute interval (~144 points max) → X-axis: `05:08 PM` (time)
  - `≤ 1 week`: 1-hour interval (~168 points max) → X-axis: `Mon 05:00 PM` (weekday & time)
  - `≤ 1 month`: 12-hour interval (~62 points max) → X-axis: `Jul 26` (month & day)
  - `≤ 1 year`: 24-hour interval (~365 points max) → X-axis: `Jul 26` / `Jul 2026` (month & year)

## Risks / Trade-offs

- **[Large Charting Dataset Overhead]** → *Mitigation*: Limit maximum data points fetched per query; backend downsampling or frontend aggregation when rendering 30-day / 1-year historical trends.
- **[CORS / API Target Resolution]** → *Mitigation*: Utilize `proxy.conf.json` for development proxying to backend `http://localhost:8080`.
