## 1. Service & API Layer

- [x] 1.1 Implement `reactivateSensor(id: number)` in `SensorService` invoking `PUT /api/sensors/{id}/reactivate`.
- [x] 1.2 Add unit tests in `sensor.service.spec.ts` for `reactivateSensor` and state updates.

## 2. Sensor Status & Maintenance Guard

- [x] 2.1 Update `SensorDialogComponent` to prompt with a confirmation warning when selecting `MAINTENANCE` status.
- [x] 2.2 Add unit tests in `sensor-dialog.component.spec.ts` for the `MAINTENANCE` confirmation dialog and status changes.

## 3. Sensor Management Table & Admin Controls

- [x] 3.1 Add inactive sensor toggle and filter controls in `SensorManagementComponent` accessible to administrators.
- [x] 3.2 Display "Delete" action button for active sensors and "Reactivate" action button for inactive sensors.
- [x] 3.3 Add reactivation confirmation modal and toast notification in `SensorManagementComponent`.
- [x] 3.4 Ensure status badge styles strictly adhere to Green (`ONLINE`), Red (`OFFLINE`), and Yellow/Amber (`MAINTENANCE`).
- [x] 3.5 Add and update unit tests in `sensor-management.component.spec.ts` covering reactivation, deletion, and filtering.

## 4. Dashboard & Map Integration

- [x] 4.1 Verify status badges and fallback sensor models with `ONLINE`, `OFFLINE`, and `MAINTENANCE` in `DashboardComponent`.
- [x] 4.2 Verify status colors and legend in `SensorMapComponent` for `ONLINE`, `OFFLINE`, and `MAINTENANCE`.
- [x] 4.3 Update unit tests in `dashboard.component.spec.ts` and `sensor-map.component.spec.ts`.

## 5. Localization & Verification

- [x] 5.1 Add translation keys in `src/assets/i18n/en.json` and `src/assets/i18n/es.json` for sensor reactivation, maintenance dialog warnings, and inactive status filters.
- [x] 5.2 Run full build (`npm run build`) and all unit tests (`npm test`) to verify zero regressions and complete coverage.
