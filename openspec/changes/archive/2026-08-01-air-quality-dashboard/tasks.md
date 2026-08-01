## 1. Setup & API Service Integration

- [x] 1.1 Add `chart.js` dependency to `package.json` for historical data graphing.
- [x] 1.2 Define air quality data interfaces in `src/app/models/air-quality.model.ts`.
- [x] 1.3 Implement `AirQualityService` in `src/app/core/services/air-quality.service.ts` connecting to `/api/air-quality/current` and historical endpoints.

## 2. Routing & RBAC Control Setup

- [x] 2.1 Update `src/app/app.routes.ts` to allow public / visitor access to `/dashboard`.
- [x] 2.2 Create `LoginPromptModalComponent` in `src/app/shared/components/login-prompt-modal/login-prompt-modal.component.ts` for visitor access triggers.

## 3. Real-Time Air Quality Component & Device Filter

- [x] 3.1 Create real-time metric card display for Temperature (°C), Humidity (%), CO2 (ppm), PM1.0 (µg/m³), PM2.5 (µg/m³), and PM10 (µg/m³).
- [x] 3.2 Implement device selector dropdown (`deviceId`) for filtering live readings across nodes.

## 4. Historical Trends Visualization & Range Pickers

- [x] 4.1 Implement `HistoricalChartComponent` utilizing `Chart.js` canvas for graphing environmental trends over time.
- [x] 4.2 Build time range shortcut selector (**Last 24 Hours**, **Last 7 Days**, **Last 30 Days**, and **Last Year** with lock indicator for visitors).
- [x] 4.3 Build Custom Date Range Picker (`From` / `To` inputs with lock indicator for visitors).
- [x] 4.4 Wire shortcut and custom range events to `AirQualityService` historical fetch queries.

## 5. Verification & Testing

- [x] 5.1 Test unauthenticated visitor view: confirm live metrics and 24h/7d/30d shortcuts function without authentication.
- [x] 5.2 Test visitor gating: confirm clicking 1 Year or Custom Range prompts login.
- [x] 5.3 Test authenticated user view: confirm full access to 1 Year data and Custom Date Range filters.
