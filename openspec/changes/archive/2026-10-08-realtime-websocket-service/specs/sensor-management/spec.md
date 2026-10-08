## ADDED Requirements

### Requirement: Real-time sensor status updates
The system SHALL ingest live sensor status notifications over WebSockets and reactively update sensor operational statuses, active status states, and last-seen timestamps across administrative views and interactive sensor maps.

#### Scenario: Live sensor status change reflected in admin management
- **WHEN** a real-time sensor status notification is received indicating a status transition (`ONLINE`, `OFFLINE`, `MAINTENANCE`) or active toggle
- **THEN** `SensorService` updates the in-memory sensor list, and `SensorManagementComponent` updates the sensor record in the table, summary counts, and displays a user notification describing the status change.
