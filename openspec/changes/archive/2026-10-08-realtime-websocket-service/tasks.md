## 1. Dependencies and Environment Configuration

- [x] 1.1 Install `@stomp/stompjs` and `sockjs-client` packages with `@types/sockjs-client` type declarations.
- [x] 1.2 Configure `wsUrl` in `src/environments/environment.ts` and `src/environments/environment.prod.ts`.
- [x] 1.3 Configure `/ws` WebSocket reverse proxy in `proxy.conf.json`.

## 2. Core Service and WebSocket Model

- [x] 2.1 Define typed WebSocket payload models (`AirQualityReadingNotification` and `SensorStatusNotification`) in `src/app/models/websocket.model.ts`.
- [x] 2.2 Implement `RealtimeService` in `src/app/core/services/realtime.service.ts` managing STOMP client activation/deactivation tied to auth state, reconnection, and topic subscriptions.
- [x] 2.3 Implement unit tests in `src/app/core/services/realtime.service.spec.ts` covering connection lifecycle, error handling, and topic message distribution.

## 3. Sensor Service & Admin Controls Integration

- [x] 3.1 Implement `handleStatusNotification` and reactive status updates in `SensorService`.
- [x] 3.2 Update `SensorManagementComponent` to subscribe to `sensorStatus$` and trigger notifications and reactive list updates.
- [x] 3.3 Add and update unit tests in `sensor.service.spec.ts` and `sensor-management.component.spec.ts`.

## 4. Dashboard Integration & Real-time Telemetry

- [x] 4.1 Update `DashboardComponent` to subscribe to `readings$` and `sensorStatus$` from `RealtimeService`.
- [x] 4.2 Ingest live air quality readings into current metric cards and recalculate the selected stoplight indicator reading.
- [x] 4.3 Update unit tests in `dashboard.component.spec.ts` verifying real-time reading ingestion and component cleanup.

## 5. Verification and Quality Checks

- [x] 5.1 Verify compilation with zero errors via `npm run build`.
- [x] 5.2 Execute all test suites via `ng test --no-watch` to confirm 100% test pass rate.
