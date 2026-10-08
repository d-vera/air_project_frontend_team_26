## ADDED Requirements

### Requirement: Real-time air quality telemetry ingestion
The system SHALL ingest live air quality reading notifications emitted over WebSockets and dynamically update dashboard telemetry metrics, sensor device lists, and stoplight health indicators without requiring manual page refresh.

#### Scenario: Live reading updates current metrics
- **WHEN** a real-time air quality reading notification is received for an existing or new sensor device
- **THEN** the dashboard updates the matching metric reading in `currentReadings` (or appends it if new), refreshes available device list options, and updates the active stoplight evaluation.
