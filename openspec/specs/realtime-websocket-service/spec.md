# realtime-websocket-service Specification

## Purpose
Provide real-time WebSocket communication infrastructure using STOMP over SockJS, managing authentication-driven connection lifecycles, topic subscriptions, and live event broadcasting for air quality readings and sensor device statuses.
## Requirements
### Requirement: WebSocket client lifecycle and authentication
The system SHALL manage STOMP over SockJS connection lifecycles automatically based on the user's authentication status, transmitting the active JWT bearer token upon connection.

#### Scenario: Activate connection when user is authenticated
- **WHEN** an authenticated session becomes active with a valid auth token
- **THEN** the system activates a STOMP client using SockJS connecting to the configured WebSocket endpoint with `Authorization: Bearer <token>` headers.

#### Scenario: Deactivate connection when user logs out
- **WHEN** the authentication token is cleared or the user logs out
- **THEN** the system terminates active STOMP subscriptions and cleanly deactivates the WebSocket client, updating connection state to `DISCONNECTED`.

### Requirement: Topic subscription and event distribution
The system SHALL provide centralized subscriptions for global event topics and dynamic subscriptions for individual sensor topics, parsing incoming JSON payloads into typed notifications.

#### Scenario: Broadcast air quality readings
- **WHEN** a STOMP message is received on `/topic/readings`
- **THEN** the system deserializes the payload into an `AirQualityReadingNotification` and emits it through the `readings$` observable.

#### Scenario: Broadcast sensor status updates
- **WHEN** a STOMP message is received on `/topic/sensors/status`
- **THEN** the system deserializes the payload into a `SensorStatusNotification` and emits it through the `sensorStatus$` observable.

#### Scenario: Dynamic sensor readings subscription
- **WHEN** a component requests dynamic subscription for a specific sensor UID via `subscribeToSensorReadings(uid)`
- **THEN** the system subscribes to `/topic/readings/{sensorUid}` and streams incoming parsed reading notifications to the subscriber.

### Requirement: Connection state observation and resilience
The system SHALL expose the current connection state (`DISCONNECTED`, `CONNECTING`, `CONNECTED`, `ERROR`) and support automatic reconnect attempts on disconnect.

#### Scenario: Track connection state during connection flow
- **WHEN** the client initiates connection, establishes connection, or encounters an error
- **THEN** the `connectionState` signal updates to reflect the current state.

