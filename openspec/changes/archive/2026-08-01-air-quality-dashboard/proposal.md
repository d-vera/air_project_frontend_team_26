## Why

The Air Quality Monitoring system requires a modern, responsive frontend dashboard to visualize both current real-time metrics and historical trend data across connected sensor nodes (devices). Furthermore, the application needs Role-Based Access Control (RBAC) to allow unauthenticated visitors to view live data and short-term trends, while restricting long-term historical analysis (1 Year) and custom date filtering to authenticated users.

## What Changes

- **Real-Time Air Quality Cards**: Display key metrics including Temperature (°C), Humidity (%), CO2 (ppm), PM1.0, PM2.5, and PM10 (µg/m³) with optional device ID filtering.
- **Device Filter Selector**: Dropdown to filter readings by a specific device (`deviceId`) or view all devices.
- **Historical Data Visualization**: Interactive line/bar charts graphing pollutant and environmental trends over time.
- **Time Range Shortcuts**: Selector for **Last 24 Hours**, **Last 7 Days**, **Last 30 Days**, and **Last Year**.
- **Custom Date Range Picker**: Controls to specify precise `From` and `To` dates/times.
- **Role-Based Access Control (RBAC)**:
  - **Visitors (Unauthenticated)**: Can view current metrics and historical shortcuts for **Last 24 Hours**, **Last 7 Days**, and **Last 30 Days**. "Last Year" and Custom Date Range controls are disabled/hidden or present a login prompt when clicked.
  - **Registered Users & Admins (JWT)**: Full access to all endpoints, including 1 Year data and Custom Date Ranges.
- **Public Dashboard Routing**: Update application route guards to allow visitor access to the dashboard feature while securing privileged options.

## Capabilities

### New Capabilities
- `air-quality-dashboard`: Real-time sensor metrics presentation, interactive historical data charts, device filtering, and RBAC-governed date range selection controls.

### Modified Capabilities

*(None)*

## Impact

- **Frontend Code**: `src/app/features/dashboard/`, `src/app/core/services/air-quality.service.ts`, `src/app/app.routes.ts`.
- **Dependencies**: Add `chart.js` (or lightweight chart wrapper) to `package.json` for data visualization.
- **Backend API Integration**: Connect to `GET /api/air-quality/current` and historical REST endpoints using `http://localhost:8080` (or proxy target).
