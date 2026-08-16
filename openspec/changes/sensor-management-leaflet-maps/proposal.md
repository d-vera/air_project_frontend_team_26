# Change Proposal: Sensor Management & Interactive Leaflet Maps

## Why

The backend has implemented the `Sensor` domain, hardware tracking (`uidSensor`), geospatial coordinates (`latitude`, `longitude`), connectivity health status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), user assignment, and full CRUD REST endpoints. The frontend needs a complete **Sensor Management & Interactive Maps** module so administrators can register, monitor, edit, and manage air quality monitoring sensor stations on an interactive map (via Leaflet & OpenStreetMap/Carto tiles) and data table, while also enabling dashboard map integration for real-time station statuses.

## What Changes

- **Sensor Data Models & Service**: Define TypeScript interfaces (`Sensor`, `SensorStatus`, `CreateSensorRequest`, `UpdateSensorRequest`) and build an Angular `SensorService` to communicate with `/api/sensors` endpoints.
- **Interactive Map Integration**: Integrate `leaflet` with custom markers indicating sensor statuses (`ONLINE` in emerald green, `OFFLINE` in red, `MAINTENANCE` in amber/yellow) and interactive popups.
- **Admin Sensor Management Views**:
  - Sensor list with filtering, searching (by UID, name, status), and tabular views.
  - Interactive map view showing physical sensor locations and status overlays.
  - Modal / Form dialog for creating and updating sensor metadata, coordinates, and assigned user.
  - Coordinate picker allowing administrators to click or drag markers on Leaflet maps or input lat/long manually.
  - Deletion / deactivation confirmation dialogs with soft-delete support.
- **Navigation & RBAC Routing**: Add routes for Sensor Management accessible by `ADMIN` roles, and integrate sensor status displays into the dashboard map view.

## Capabilities

### New Capabilities
- `sensor-management`: Management of sensor devices including CRUD operations, hardware UID tracking, user assignment, health status transitions, and administrative table/dialog workflows.
- `interactive-map-integration`: Interactive Leaflet map component displaying sensor station markers with status color-coding, coordinate selection picker, popups, and map controls.

### Modified Capabilities
- `air-quality-dashboard`: Integrate live sensor station coordinates, status badges, and interactive map popups into the air quality monitoring dashboard.

## Impact

- **Frontend Services & Components**: Adds `src/app/core/services/sensor.service.ts`, `src/app/models/sensor.model.ts`, sensor management components (list, form/modal, map component), and routing entries.
- **Dependencies**: Uses `leaflet` and `@types/leaflet` without external proprietary API keys.
- **API Endpoints**: Consumes `/api/sensors` (GET, GET by ID, POST, PUT, DELETE).

