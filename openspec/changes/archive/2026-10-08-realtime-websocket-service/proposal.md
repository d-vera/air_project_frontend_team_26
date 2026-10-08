# Proposal: Realtime WebSocket Service

## Why

Air quality monitoring requires instantaneous observation of environmental hazards and immediate awareness of sensor device connectivity changes. Previously, the client relied solely on initial REST HTTP fetches or manual page refreshes, which could delay critical air quality alerts and out-of-sync sensor operational statuses. Providing an event-driven STOMP over SockJS WebSocket communication layer enables automatic, instantaneous data synchronization across dashboard metrics and administrative sensor views.

## What Changes

- Add `@stomp/stompjs` and `sockjs-client` client dependencies and SockJS type declarations.
- Introduce `RealtimeService` managing connection lifecycle tied to user authentication, automatic reconnections, heartbeats, and STOMP topic subscriptions.
- Define strongly-typed data contracts for incoming WebSocket payloads (`AirQualityReadingNotification`, `SensorStatusNotification`).
- Integrate real-time reading notifications into `DashboardComponent` to dynamically update metric cards, device selectors, and stoplight calculations without manual refreshes.
- Integrate real-time sensor status notifications into `SensorService` and `SensorManagementComponent` to update device status badges, last seen timestamps, and active sensor lists instantaneously.
- Configure proxy and environment WebSocket connection endpoints (`wsUrl`).

## Capabilities

### New Capabilities
- `realtime-websocket-service`: Core STOMP/SockJS connection management, authentication-driven lifecycle activation/deactivation, subscription caching, and real-time event distribution.

### Modified Capabilities
- `air-quality-dashboard`: Consume live WebSocket reading events to update current metric cards and stoplight indicators in real-time.
- `sensor-management`: Update sensor connectivity status, last seen timestamps, and reactive device lists when receiving real-time sensor status notifications.

## Impact

- **Dependencies**: Adds `@stomp/stompjs` and `sockjs-client` to `package.json`.
- **Environment**: Adds `wsUrl` to environment configuration files.
- **Development Proxy**: Adds `/ws` proxy rule forwarding WebSocket handshakes in `proxy.conf.json`.
- **Services**: `RealtimeService` added to core services; `SensorService` updated with reactive state subjects and `handleStatusNotification`.
- **Components**: `DashboardComponent` and `SensorManagementComponent` subscribe to real-time events.
