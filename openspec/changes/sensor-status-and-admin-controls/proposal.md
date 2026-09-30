## Why

The backend has implemented automatic sensor offline detection (marking sensors OFFLINE after 1 hour without incoming telemetry, and back to ONLINE upon data arrival), admin sensor status overrides (ONLINE, OFFLINE, MAINTENANCE with maintenance-lock behavior), and a dedicated sensor reactivation endpoint (`PUT /api/sensors/{id}/reactivate`). The frontend must integrate these backend enhancements so that administrators and regular users have accurate visibility into sensor connectivity health, and administrators have full control over sensor lifecycle and status overrides. Real-time live status synchronization will be handled via WebSockets separately.

## What Changes

- **Sensor Service API Extension**: Add `reactivateSensor(id: number)` to `SensorService` to invoke `PUT /api/sensors/{id}/reactivate`.
- **Status Indicator & Color Consistency**: Standardize sensor status indicators across Dashboard, Sensor Management table, and Sensor Map components with distinct color states:
  - `ONLINE`: 🟢 Green
  - `OFFLINE`: 🔴 Red
  - `MAINTENANCE`: 🟡 Yellow
- **Admin Status Controls & Confirmation**: Provide admin status selection (`ONLINE`, `OFFLINE`, `MAINTENANCE`) in the sensor edit dialog/detail view, with an explicit confirmation dialog when selecting `MAINTENANCE` warning that automatic status changes will be locked until transitioned out by an admin.
- **Soft-Delete & Reactivation Flow**: In the admin sensor list:
  - Allow admin users to toggle viewing active vs. inactive (soft-deleted) sensors.
  - Display "Delete" (soft-delete) action for active sensors (`DELETE /api/sensors/{id}`).
  - Display "Reactivate" action for inactive sensors (`PUT /api/sensors/{id}/reactivate`), returning the sensor to `active: true` and `sensorStatus: OFFLINE`.
- **Role-Based Visibility**: Ensure regular users can view statuses and live indicators, while status modification, soft-delete, reactivation, and inactive viewing actions are strictly restricted to administrators.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `sensor-management`: Extend sensor management specifications to cover reactivation (`PUT /api/sensors/{id}/reactivate`), maintenance mode confirmation guards, and inactive sensor filtering and visibility controls.

## Impact

- **Models**: `src/app/models/sensor.model.ts` (verify status types and requests).
- **Services**: `src/app/core/services/sensor.service.ts` (`reactivateSensor` method).
- **Components**:
  - `src/app/features/admin/sensor-management/sensor-management.component.ts` (inactive toggle, reactivate button, delete flow).
  - `src/app/features/admin/sensor-management/sensor-dialog/sensor-dialog.component.ts` (maintenance confirmation modal/warning).
  - `src/app/features/dashboard/dashboard.component.ts` (status badges).
  - `src/app/shared/components/sensor-map/sensor-map.component.ts` (marker and legend status alignment).
- **Localization**: `src/assets/i18n/en.json` and `src/assets/i18n/es.json` (add keys for reactivation, maintenance warnings, inactive sensor filter).
- **Specs**: Delta spec for `sensor-management`.
