## Context

The backend has implemented three key capabilities:
1. **Automatic Sensor Offline Detection**: Sensors without incoming telemetry for 1 hour transition automatically to `OFFLINE`. When new telemetry arrives, they revert to `ONLINE`. The backend scheduler evaluates sensor status every 5 minutes.
2. **Admin Status Overrides & Maintenance Lock**: Admins can set `sensorStatus` to `ONLINE`, `OFFLINE`, or `MAINTENANCE` via `PUT /api/sensors/{id}`. When placed in `MAINTENANCE`, automatic status transitions are suspended by the backend until an admin manually changes it.
3. **Soft-Delete & Reactivation**: `DELETE /api/sensors/{id}` marks a sensor inactive (`active: false`). A new endpoint `PUT /api/sensors/{id}/reactivate` restores an inactive sensor to `active: true` with initial `sensorStatus: OFFLINE`.

The frontend must provide intuitive admin controls for these features, prevent accidental lock into `MAINTENANCE` with a confirmation dialog, and visually display the 3 status states using consistent color coding across all views. Live real-time streaming of telemetry and status changes will be integrated separately using WebSockets.

## Goals / Non-Goals

**Goals:**
- Extend `SensorService` with `reactivateSensor(id: number)` calling `PUT /api/sensors/{id}/reactivate`.
- Provide a confirmation prompt when an admin changes a sensor status to `MAINTENANCE` informing them that automatic status changes will be suspended.
- In `SensorManagementComponent`, allow admins to view inactive (soft-deleted) sensors, displaying a red "Delete" button for active sensors and a green "Reactivate" button for inactive sensors.
- Maintain consistent status styling across all views (Management table, Dashboard cards, and Leaflet Sensor Map):
  - `ONLINE`: 🟢 Green (`bg-emerald-500` / `#10B981`)
  - `OFFLINE`: 🔴 Red (`bg-rose-500` / `#EF4444`)
  - `MAINTENANCE`: 🟡 Yellow/Amber (`bg-amber-500` / `#F59E0B`)
- Ensure non-admin users only view active sensors and status indicators, while all admin controls remain hidden.

**Non-Goals:**
- Implementing real-time polling or WebSocket connections in this change (live status updates and telemetry streaming will be handled via WebSockets in a dedicated feature).
- Modifying backend endpoints or database schemas.

## Decisions

### Decision 1: Inactive Sensor Management & State Handling
- **Choice**: In `SensorManagementComponent`, add an "Include Inactive" toggle for administrators. Support query param `includeInactive=true` on `SensorService.getSensors()` if backend supports it, while gracefully merging local state for soft-deleted sensors so admins can immediately see them as inactive and reactivate them.
- **Rationale**: Gives admins immediate access to soft-deleted sensors to perform reactivation without requiring backend query changes if not present.
- **Alternatives Considered**: Separate dedicated page for deactivated sensors (too cumbersome for quick operations compared to an integrated toggle/filter).

### Decision 2: Maintenance Mode Confirmation Modal
- **Choice**: When `MAINTENANCE` is selected in `SensorDialogComponent` or inline status dropdown, show a confirmation modal or prompt: *"Setting this sensor to Maintenance mode will prevent automatic status changes. Only an admin can change it back. Continue?"*
- **Rationale**: Prevents accidental manual overrides that disable the backend's automated offline detection.
- **Alternatives Considered**: Simple HTML5 `confirm()` dialog (looks dated and inconsistent with custom Tailwind/Dark-mode dialogs). We will use an in-app styled modal matching existing confirmation dialogs.

### Decision 3: Action Button Switching (Delete vs. Reactivate)
- **Choice**: In the sensor management table, active sensors render the "Deactivate" / "Delete" button (rose styling). When displaying inactive sensors, the button renders as "Reactivate" (emerald styling) invoking `reactivateSensor(id)`.
- **Rationale**: Clear visual affordance adhering to the backend's two-state lifecycle.

## Risks / Trade-offs

- **[Risk] Inactive sensors endpoint returning only active sensors**:
  - *Mitigation*: Provide optional param in `sensorService.getSensors(refresh, includeInactive)` and maintain soft-deleted entries locally in signal state if the backend returns active-only.

## Open Questions

- None; all backend contracts (`PUT /api/sensors/{id}`, `DELETE /api/sensors/{id}`, `PUT /api/sensors/{id}/reactivate`, status values) are fully defined and stabilized.
