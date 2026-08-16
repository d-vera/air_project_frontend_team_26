# air-quality-dashboard Specification

## Purpose
Provide real-time air quality metric visualization and historical trend analysis across multiple metrics and time ranges with role-based access control.

## Requirements

### Requirement: Real-time air quality metric display
The system SHALL display current real-time air quality metrics for connected devices, including Temperature (°C), Humidity (%), CO2 (ppm), PM1.0 (µg/m³), PM2.5 (µg/m³), and PM10 (µg/m³).

#### Scenario: Display current readings
- **WHEN** a user or visitor opens the air quality dashboard
- **THEN** the dashboard fetches and presents real-time cards for Temperature, Humidity, CO2, PM1.0, PM2.5, and PM10.

#### Scenario: Filter current readings by device
- **WHEN** a user selects a specific device ID from the device dropdown selector
- **THEN** the dashboard updates the real-time metric cards to show data exclusively for that device.

---

### Requirement: Historical data chart visualization
The system SHALL provide interactive charts visualizing historical pollutant and environmental trends over time.

#### Scenario: Render historical trends
- **WHEN** historical data is loaded for a selected time range
- **THEN** the system renders interactive line or bar charts representing temperature, humidity, CO2, and particulate matter trends.

---

### Requirement: Time range shortcuts selector
The system SHALL provide quick selector shortcuts for Last 24 Hours, Last 7 Days, Last 30 Days, and Last Year.

#### Scenario: Select standard time shortcut
- **WHEN** an authorized user clicks a range shortcut button (e.g., Last 7 Days)
- **THEN** the dashboard fetches and graphs the historical dataset corresponding to that duration.

---

### Requirement: Custom date range picker
The system SHALL support custom date filtering using `From` and `To` date/time inputs for authorized users.

#### Scenario: Select custom date range
- **WHEN** an authorized user specifies a `From` date and `To` date and submits the filter
- **THEN** the dashboard queries the backend historical endpoint for the requested date window and updates the chart accordingly.

---

### Requirement: Dynamic timeline formatting based on range duration
The system SHALL dynamically adjust the x-axis timeline label formatting and data sampling intervals based on the duration of the selected query range (10 min for ≤ 1 day, 1 hour for ≤ 1 week, 12 hours for ≤ 1 month, 24 hours for ≤ 1 year).

#### Scenario: Display 24-hour range timeline labels
- **WHEN** the "Last 24 Hours" shortcut is selected
- **THEN** the chart timeline displays x-axis labels formatted as hours and minutes (e.g., `05:08 PM`).

#### Scenario: Display multi-day range timeline labels
- **WHEN** "Last 7 Days", "Last 30 Days", or "Last Year" shortcut is selected
- **THEN** the chart timeline displays x-axis labels formatted with appropriate date markers (weekday/time for 7 days, month/day for 30 days, month/year for 1 year).

---

### Requirement: Role-based access control for historical data
The system SHALL enforce role-based access control (RBAC) restricting long-term (Last Year) and custom date range features to authenticated users while keeping short-term ranges available to visitors.

#### Scenario: Visitor accessing public shortcuts
- **WHEN** an unauthenticated visitor views the historical shortcuts
- **THEN** the Last 24 Hours, Last 7 Days, and Last 30 Days options are accessible and active.

#### Scenario: Visitor selecting restricted options
- **WHEN** an unauthenticated visitor clicks or attempts to select "Last Year" or the Custom Date Range picker
- **THEN** the system prevents execution and presents a login prompt modal or notification to log in.

#### Scenario: Authenticated user accessing restricted options
- **WHEN** a logged-in user with a valid JWT token selects "Last Year" or specifies a custom date range
- **THEN** the system processes the request and displays the historical data visualization.
