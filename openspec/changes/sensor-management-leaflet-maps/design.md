## Context

The backend provides complete support for the `Sensor` entity with endpoints under `/api/sensors`. This includes latitude/longitude coordinates, hardware MAC identifier (`uidSensor`), operational status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), last-seen timestamps, and assigned user identifiers. The frontend exposes these capabilities through an administrative sensor management module and an interactive Leaflet map component embedded both in the management panel and the monitoring dashboard.

## Goals / Non-Goals

**Goals:**
- Implement `SensorService` adhering to the `/api/sensors` OpenAPI / REST specification.
- Create TypeScript model types (`Sensor`, `SensorStatus`, `CreateSensorRequest`, `UpdateSensorRequest`).
- Integrate Leaflet map rendering with OpenStreetMap / Carto light and dark tile layers to display dynamic markers with status badges (`ONLINE`: emerald green, `OFFLINE`: crimson red, `MAINTENANCE`: amber orange).
- Build Admin Sensor Management view (`/admin/sensors`) featuring a responsive data table, search/filter controls, map view toggle, CRUD dialogs, and a coordinate picker.
- Integrate sensor station location markers and interactive popups into the dashboard view.

**Non-Goals:**
- Real-time WebSocket streaming of GPS movements (sensors are fixed stations).
- Complex polygon geofencing or route tracking.

## Decisions

1. **Interactive Map Component Strategy**:
   - *Decision*: Utilize `leaflet` and OpenStreetMap / Carto tiles via Angular standalone components (`SensorMapComponent`, `MapCoordinatePickerComponent`).
   - *Rationale*: Open-source, avoids mandatory Google Cloud billing/API keys, fast rendering, highly customizable HTML/SVG markers and dark mode tile compatibility.
   - *Alternative Considered*: Google Maps (`@angular/google-maps`); rejected to eliminate external API key requirements, quota limits, and billing dependencies.

2. **State & Notification Management**:
   - *Decision*: Use reactive RxJS BehaviorSubjects in `SensorService` to cache active sensor lists and broadcast updates across components (admin table & dashboard map).
   - *Rationale*: Avoids unnecessary redundant network queries when navigating between dashboard and admin views.

3. **Status Color-Coding Architecture**:
   - *Decision*: Centralize status color & icon mapping (`ONLINE` -> emerald green, `OFFLINE` -> crimson red, `MAINTENANCE` -> amber orange) in a shared sensor utility/constant.
   - *Rationale*: Guarantees uniform visual language across table badges, map markers, and dashboard cards.

4. **Coordinate Picker Interaction**:
   - *Decision*: In the sensor creation/edit dialog, allow both typing decimal lat/long coordinates and clicking/dragging a marker directly on an embedded Leaflet map preview.
   - *Rationale*: Prevents human error in typing GPS coordinates and provides instant visual verification of sensor placement.

## Risks / Trade-offs

- **[Risk] Leaflet default icon asset paths in Angular bundler** → *Mitigation*: Use custom CSS/SVG div-icons for sensor markers rather than relying on default Leaflet PNG image assets.
- **[Risk] Coordinate rendering out of bounds** → *Mitigation*: Automatically compute map bounds (`L.latLngBounds`) based on active sensor positions to center and zoom appropriately.

