## 1. Models & Services Setup

- [x] 1.1 Create `Sensor`, `SensorStatus`, `CreateSensorRequest`, and `UpdateSensorRequest` TypeScript models in `src/app/models/sensor.model.ts`
- [x] 1.2 Implement `SensorService` in `src/app/core/services/sensor.service.ts` connecting to `/api/sensors` CRUD endpoints with RxJS caching and state subjects

## 2. Leaflet Map Component Integration

- [x] 2.1 Install/configure `leaflet` and `@types/leaflet` dependencies with CSS tile imports
- [x] 2.2 Build reusable `SensorMapComponent` with custom colored markers (`ONLINE`, `OFFLINE`, `MAINTENANCE`), auto-centering bounds, and interactive popups
- [x] 2.3 Build `MapCoordinatePickerComponent` allowing drag-and-drop marker placement and interactive coordinate selection

## 3. Admin Sensor Management UI

- [x] 3.1 Create `SensorManagementComponent` under admin routing with tabular list, status badges, and search/status filter controls
- [x] 3.2 Create `SensorDialogComponent` (Create/Edit modal) integrating form validation, user assignment selector, and coordinate picker
- [x] 3.3 Add delete confirmation dialog with soft-delete action handling and toast notifications
- [x] 3.4 Configure admin navigation menu items and RBAC route guards for `/admin/sensors`

## 4. Dashboard Integration & Verification

- [x] 4.1 Integrate `SensorMapComponent` into the air quality monitoring dashboard to visualize sensor station health alongside metric cards
- [x] 4.2 Verify build (`npm run build`), unit tests, and runtime API interactions with the backend OpenAPI schema

