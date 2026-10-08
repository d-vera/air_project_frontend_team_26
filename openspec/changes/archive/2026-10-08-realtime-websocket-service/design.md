# Design: Realtime WebSocket Service

## Context

The air quality monitoring application displays air quality sensor readings and device connectivity statuses to general users and administrators. While initial data is retrieved via REST APIs (`/api/sensors`, `/api/air-quality-readings`), environmental changes and device disconnections occur asynchronously. Relying on polling creates unnecessary network traffic, while manual user refreshes lead to stale information. Introducing STOMP over SockJS enables a push-based communication pattern compatible with Spring Boot WebSocket backends and corporate firewalls/proxies.

## Goals / Non-Goals

**Goals:**
- Provide a robust Angular singleton service (`RealtimeService`) that manages STOMP/SockJS client lifecycles.
- Automatically activate WebSocket connections when a user is authenticated and deactivate when logged out.
- Support automatic reconnection (5-second delay) and client/server heartbeats (4000ms).
- Provide centralized observable streams for broadcast topics (`/topic/readings`, `/topic/sensors/status`).
- Support dynamic individual sensor topic subscriptions (`/topic/readings/{sensorUid}`).
- Reactively integrate incoming notifications into `SensorService`, `SensorManagementComponent`, and `DashboardComponent`.

**Non-Goals:**
- Implementing bidirectional chat or client-to-server messaging (current scope is client consumption/subscription of server-broadcast events).
- Replacing REST APIs for historical query ranges and initial page data hydration.

## Decisions

### 1. Library Selection: `@stomp/stompjs` + `sockjs-client`
- **Choice**: Use `@stomp/stompjs` with `SockJS` fallback factory.
- **Rationale**: The Spring Boot backend exposes a SockJS endpoint at `/ws`. Native browser WebSockets may fail in environments with strict HTTP proxies that block raw WebSocket upgrades. SockJS provides seamless HTTP streaming/polling fallbacks.
- **Alternatives considered**: Raw `WebSocket` API (no STOMP protocol framing, no SockJS fallback support); Socket.IO (incompatible with Spring STOMP broker).

### 2. Authentication-Driven Lifecycle
- **Choice**: Use Angular Signals `effect()` listening to `AuthService.token()`.
- **Rationale**: Connecting without an active JWT is rejected by secure backends. Attaching the JWT in STOMP `connectHeaders` ensures authorized channel subscription. Automatically deactivating on logout prevents credential leaks and orphan connections.
- **Alternatives considered**: Manual connect/disconnect calls from route guards or components (prone to lifecycle leaks across navigation).

### 3. State Management & Component Integration
- **Choice**: Expose RxJS Observables from `RealtimeService` (`readings$`, `sensorStatus$`) and let domain services/components consume and update their local signals.
- **Rationale**: Keeps `RealtimeService` focused on transport and protocol framing while `SensorService` and `DashboardComponent` manage domain-specific state (updating existing lists, recalculating stoplight status, triggering UI notifications).

## Risks / Trade-offs

- **[High event volume during mass sensor updates]** → Mitigation: Lightweight payload parsing and targeted signal updates; components update in-memory lists without re-triggering full REST HTTP reloads.
- **[Network drops & intermittent connection]** → Mitigation: Built-in STOMP reconnection timer (`reconnectDelay: 5000`) and exposed `connectionState` signal (`'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR'`).
- **[Token expiration during long active sessions]** → Mitigation: `RealtimeService` listens to auth token changes; upon token renewal or logout, connection is re-established or cleanly torn down.
