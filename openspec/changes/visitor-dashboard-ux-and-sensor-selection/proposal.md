## Why

Unauthenticated visitors (unregistered citizens) can access the public air quality dashboard up to a 1-month historical window without logging in, but the current UI exposes authenticated-only navigation items (`Profile`, `Preferences`, `Reports`, and `Log Out`) and mislabels visitors as `"User"` / `"Registered User"`. In addition, selecting a specific sensor in the dashboard overwrites the selectable sensor dropdown list and falls back to hardcoded demo data when a sensor has no current reading.

## What Changes

- Update the sidebar navigation and user badge for unauthenticated visitors:
  - Display a `Visitor` / `Visitante` identity badge instead of `"User"` / `"Registered User"`.
  - Hide `My Profile`, `Preferences`, and `Reports` navigation links (preventing visitor access to comparison/reports and other authenticated-only routes from the menu).
  - Hide the `Log Out` button and display a `Log In` button navigating to `/login`.
- Add bilingual (`en.json` and `es.json`) translation keys for the visitor identity badge and public-access subtitle.
- Fix dashboard sensor selection (`DashboardComponent` and `RealTimeCardsComponent`):
  - Keep the full list of active sensors from `GET /api/sensors` available in the selector when a single sensor is chosen (both via dropdown and map click).
  - Display friendly sensor names (`name (uidSensor)`) in the sensor dropdown.
  - Avoid replacing empty per-sensor current readings with hardcoded fallback demo data (`ESP32_001`) so visitors see an accurate empty state for offline/quiet sensors while still loading their historical data (up to 30 days).

## Capabilities

### New Capabilities

### Modified Capabilities
- `responsive-layout`: Differentiate unauthenticated visitor state in the sidebar (display `Visitor` identity, show only `Dashboard`, hide `Profile`/`Preferences`/`Reports` and `Log Out`, and show `Log In`).
- `air-quality-dashboard`: Preserve the full sensor selector list when filtering by `deviceId`, display sensor names from the sensor registry, and show an accurate empty state rather than hardcoded fallback data when a selected sensor has no current reading.

## Impact

- **Components**: `SidebarComponent`, `DashboardComponent`, `RealTimeCardsComponent`.
- **Translations**: `src/assets/i18n/en.json`, `src/assets/i18n/es.json`.
- **Tests**: Unit tests for `SidebarComponent` (new/updated), `DashboardComponent`, `RealTimeCardsComponent`, and `ShellComponent` (if affected).
- **APIs**: Uses existing public endpoints `GET /api/sensors`, `GET /api/air-quality/current`, and `GET /api/air-quality/historical` (`LAST_DAY`, `LAST_WEEK`, `LAST_MONTH` for visitors).

