## 1. Translations (i18n)

- [x] 1.1 Add visitor translation keys (e.g., `NAV.VISITOR` and `NAV.VISITOR_ACCESS` / `ADMIN.ROLE_VISITOR`) to `src/assets/i18n/en.json`
- [x] 1.2 Add corresponding Spanish visitor translation keys (`Visitante`, `Acceso Público`, etc.) to `src/assets/i18n/es.json`

## 2. Visitor Sidebar & Navigation UX

- [x] 2.1 Update `SidebarComponent` user badge to show the translated Visitor label and public-access badge (with `V` avatar initial) when `!authService.isAuthenticated()`, instead of `"User"` / `"Registered User"`
- [x] 2.2 Gate `My Profile`, `Preferences`, and `Reports` navigation links in `SidebarComponent` behind `@if (authService.isAuthenticated())` so visitors only see `Dashboard`
- [x] 2.3 Replace the `Log Out` button with a `Log In` link/button (`routerLink="/login"`, calling `closeSidebar.emit()`) in `SidebarComponent` when `!authService.isAuthenticated()`

## 3. Sensor Selection Bug Fix & Friendly Labels

- [x] 3.1 Update `DashboardComponent` to build sensor selector options from `sensors()` (`GET /api/sensors`) merged with unfiltered `currentReadings()` / WebSocket devices, without overwriting the full list when `selectedDeviceId()` is non-empty
- [x] 3.2 Update `DashboardComponent.loadCurrentData()` so that when `selectedDeviceId()` is non-empty and the API returns no current readings (or errors), `currentReadings` is set to `[]` instead of invoking `setFallbackCurrentData()`
- [x] 3.3 Update `RealTimeCardsComponent` to display friendly sensor labels (`name (uidSensor)`) when sensor metadata is provided, while remaining backward-compatible with string device IDs

## 4. Tests & Verification

- [x] 4.1 Add unit tests for `SidebarComponent` (`sidebar.component.spec.ts`) covering visitor state (Visitor badge, only Dashboard link, Login button, no Logout/Profile/Preferences/Reports) and authenticated/admin states
- [x] 4.2 Add/update unit tests in `dashboard.component.spec.ts` and `real-time-cards.component.spec.ts` (if applicable) verifying sensor dropdown options remain intact after selecting a device, friendly labels render, and empty per-device current readings do not trigger hardcoded fallback data
- [x] 4.3 Run `ng build` and `npm test` to confirm clean compilation and passing unit tests with no regressions

