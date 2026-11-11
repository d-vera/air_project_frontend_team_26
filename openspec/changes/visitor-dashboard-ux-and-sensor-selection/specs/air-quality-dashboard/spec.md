## MODIFIED Requirements

### Requirement: Real-time air quality metric display
The system SHALL display current real-time air quality metrics for connected devices, including Temperature (°C), Humidity (%), CO2 (ppm), PM1.0 (µg/m³), PM2.5 (µg/m³), and PM10 (µg/m³), while preserving full sensor selection options for visitors and authenticated users.

#### Scenario: Display current readings
- **WHEN** a user or visitor opens the air quality dashboard
- **THEN** the dashboard fetches and presents real-time cards for Temperature, Humidity, CO2, PM1.0, PM2.5, and PM10

#### Scenario: Filter current readings by device without losing selector options
- **WHEN** a user or visitor selects a specific sensor from the device dropdown selector or clicks a sensor marker on the map
- **THEN** the dashboard updates the real-time metric cards and historical chart for that sensor, displays station names alongside UIDs in the dropdown, and keeps all other active sensors available in the dropdown for direct switching

#### Scenario: Selected sensor has no current readings
- **WHEN** a user or visitor selects a specific sensor (e.g., an `OFFLINE` or `MAINTENANCE` station) and `GET /api/air-quality/current?deviceId=...` returns an empty `readings` array
- **THEN** the dashboard clears `currentReadings` to show the empty-state message (`DASHBOARD.NO_READINGS`) instead of substituting hardcoded fallback demo data, while continuing to load historical readings for that sensor

