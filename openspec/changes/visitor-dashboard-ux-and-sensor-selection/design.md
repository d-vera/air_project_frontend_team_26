## Context

The public air quality dashboard (`/dashboard`) is wrapped in `ShellComponent`, which renders `SidebarComponent` and `NavbarComponent` for both authenticated users and unauthenticated visitors (unregistered citizens). While `/dashboard` and the backend endpoints (`GET /api/sensors`, `GET /api/air-quality/current`, and `GET /api/air-quality/historical` for `LAST_DAY`, `LAST_WEEK`, and `LAST_MONTH`) already allow visitor access without login, two UX and functional gaps remain:

1. `SidebarComponent` does not check `AuthService.isAuthenticated()` for the user badge, navigation links (`Profile`, `Preferences`, `Reports`), or footer action (`Log Out`), causing visitors to be labeled as `"Registered User"` and shown links that redirect to `/login`.
2. `DashboardComponent.loadCurrentData()` overwrites `deviceList` with only the filtered `currentReadings` response when a single sensor is selected, and calls `setFallbackCurrentData()` (hardcoded `ESP32_001`) whenever a selected sensor has no current reading.

## Goals / Non-Goals

**Goals:**
- Present an accurate, welcoming visitor experience in `SidebarComponent`: `Visitor` / `Visitante` identity badge, only `Dashboard` in the sidebar menu (hiding `Profile`, `Preferences`, and `Reports`), no `Log Out` button, and a `Log In` button pointing to `/login`.
- Provide bilingual translation keys (`en.json` and `es.json`) for all visitor sidebar strings.
- Ensure visitors (and authenticated users) can freely switch between all active sensors via dropdown or map click without losing options in the dropdown or seeing hardcoded demo data when an individual sensor has no current reading.

**Non-Goals:**
- Opening `/dashboard/reports` or comparison mode to unauthenticated visitors (`authGuard` remains on `/dashboard/reports`, `/dashboard/profile`, and `/dashboard/preferences`).
- Changing backend API endpoints or WebSocket behavior.
- Introducing geographic "zone" groupings beyond the existing sensor registry (`name` + `uidSensor`).

## Decisions

### 1. Gate Sidebar Badge, Links, and Auth Actions on `authService.isAuthenticated()`
- **Decision:** In `SidebarComponent`, conditionally render:
  - When authenticated: existing email, role badge (`ADMIN.ROLE_ADMIN` / `ADMIN.ROLE_REGISTERED_USER`), `Dashboard`, `My Profile`, `Preferences`, `Reports`, admin section (if admin), and `Log Out`.
  - When unauthenticated (visitor): avatar initial (`V` or icon), `NAV.VISITOR` label (`Visitor` / `Visitante`), `NAV.VISITOR_ACCESS` subtitle (`Public Access (30 days)` / `Acceso Público (30 días)`), only the `Dashboard` link, and a `Log In` link/button (`routerLink="/login"`, `NAV.LOGIN`) in the footer in place of `Log Out`.
- **Rationale:** Matches Option A (visitors stay on `/dashboard` and have no access to Comparison/Reports) without showing dead-end links that bounce to `/login`.
- **Alternatives considered:** Showing lock icons next to `Profile`/`Preferences`/`Reports` for visitors. Rejected per user preference to keep the visitor menu uncluttered and avoid exposing `Reports` at all.

### 2. Derive Sensor Dropdown Options from `sensors()` + `currentReadings()` Without Overwriting on Filter
- **Decision:** Replace the `string[]` `deviceList` overwrite inside `loadCurrentData()` with a computed list of sensor options (`{ uid: string; label: string }`, or keeping `deviceList` populated from `sensors()` and unfiltered `currentReadings()`):
  - Primary source: `sensors()` from `GET /api/sensors` (formatted as `${sensor.name} (${sensor.uidSensor})`, or fallback to `uidSensor` if name is absent).
  - Merge any extra `deviceId` values seen only when `selectedDeviceId()` is empty (e.g., unfiltered `currentReadings` or live WebSocket readings) so devices not in `sensors` aren't lost.
  - Never overwrite the full option list when `selectedDeviceId()` is non-empty.
- **Rationale:** Clicking a marker on `SensorMapComponent` or choosing a station in `RealTimeCardsComponent` keeps every other station immediately selectable in the dropdown and gives human-readable station names.
- **Alternatives considered:** Only skipping `deviceList.set()` when `selectedDeviceId()` is non-empty. That still leaves raw UIDs (`ACEA5AC8E720`) instead of station names and misses sensors without current readings; deriving from `sensors()` solves both.

### 3. Distinguish "Filtered Sensor Has No Current Reading" from "Global API Unavailable"
- **Decision:** In `DashboardComponent.loadCurrentData()`:
  - If `res.readings` is empty **and** `selectedDeviceId()` is non-empty: set `currentReadings.set([])` so `RealTimeCardsComponent` renders its existing empty state (`DASHBOARD.NO_READINGS`), rather than calling `setFallbackCurrentData()`.
  - Keep `setFallbackCurrentData()` (or empty state) only when an unfiltered request fails/returns empty, and ensure `setFallbackCurrentData()` never replaces real `sensors()` in the dropdown if `sensors()` already loaded.
- **Rationale:** Visitors selecting an `OFFLINE` or `MAINTENANCE` sensor on the map should see an accurate "no current readings" message alongside that sensor's 30-day historical chart, not fake `ESP32_001` metrics.

## Risks / Trade-offs

- **Risk:** Existing unit tests for `RealTimeCardsComponent` or `DashboardComponent` may pass `deviceList: string[]` directly as `@Input()`.
  → **Mitigation:** Either support both `deviceList` (`string[]`) and an optional `sensorOptions` (`{ id: string; label: string }[]`) input on `RealTimeCardsComponent` (keeping `deviceList` backward-compatible), or update all component callers and `.spec.ts` files together. Keeping `sensorOptions` optional or updating `RealTimeCardsComponent` cleanly avoids breaking existing tests.
- **Risk:** `NavbarComponent` vs `SidebarComponent` terminology—desktop shows `SidebarComponent` continuously while mobile toggles it from `NavbarComponent`.
  → **Mitigation:** `NavbarComponent` already renders a `Log In` button when unauthenticated and no `Reports` link; updating `SidebarComponent` covers both the desktop menu and the mobile slide-over menu.

