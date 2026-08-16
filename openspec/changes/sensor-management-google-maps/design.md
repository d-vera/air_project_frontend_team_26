## Context

The backend provides complete support for the `Sensor` entity with endpoints under `/api/sensors`. This includes latitude/longitude coordinates, hardware MAC identifier (`uidSensor`), operational status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), last-seen timestamps, and assigned user identifiers. The frontend needs to expose these capabilities through an administrative sensor management module and an interactive Google Maps component embedded both in the management panel and the monitoring dashboard.

## Goals / Non-Goals

**Goals:**
- Implement `SensorService` adhering to the `/api/sensors` OpenAPI / REST specification.
- Create TypeScript model types (`Sensor`, `SensorStatus`, `CreateSensorRequest`, `UpdateSensorRequest`).
- Integrate Google Maps JavaScript API via `@angular/google-maps` or custom script loader wrapper to display dynamic markers with status badges (`ONLINE`: green, `OFFLINE`: red, `MAINTENANCE`: orange).
- Build Admin Sensor Management view (`/admin/sensors`) featuring a responsive data table, search/filter controls, map view toggle, CRUD dialogs, and a coordinate picker.
- Integrate sensor station location markers and status tooltips into the dashboard view.

**Non-Goals:**
- Real-time WebSocket streaming of GPS movements (sensors are fixed stations).
- Complex polygon geofencing or route tracking.

## Decisions

1. **Google Maps Component Strategy**:
   - *Decision*: Utilize `@angular/google-maps` components (`<google-map>`, `<map-marker>`, `<map-info-window>`) or dynamic script loader with fallback handling.
   - *Rationale*: Angular's official wrapper provides reactive inputs, lifecycle binding, and clean integration with Angular change detection.
   - *Alternative Considered*: Raw `google.maps` DOM manipulation; rejected due to maintenance overhead and change detection sync issues.

2. **State & Notification Management**:
   - *Decision*: Use reactive RxJS BehaviorSubjects in `SensorService` to cache active sensor lists and broadcast updates across components (admin table & dashboard map).
   - *Rationale*: Avoids unnecessary redundant network queries when navigating between dashboard and admin views.

3. **Status Color-Coding Architecture**:
   - *Decision*: Centralize status color & icon mapping (`ONLINE` -> emerald green, `OFFLINE` -> crimson red, `MAINTENANCE` -> amber orange) in a shared sensor utility/constant.
   - *Rationale*: Guarantees uniform visual language across table badges, map markers, and dashboard cards.

4. **Coordinate Picker Interaction**:
   - *Decision*: In the sensor creation/edit dialog, allow both typing decimal lat/long coordinates and clicking/dragging a marker directly on an embedded map preview.
   - *Rationale*: Prevents human error in typing GPS coordinates and provides instant visual verification of sensor placement.

## Risks / Trade-offs

- **[Risk] Google Maps API Key dependency or quota limits** → *Mitigation*: Support configurable API key via environment files with graceful fallback placeholder when API key is unconfigured or offline.
- **[Risk] Coordinate rendering out of bounds** → *Mitigation*: Automatically compute map bounds (`LatLngBounds`) based on active sensor positions to center and zoom appropriately.
