## MODIFIED Requirements

### Requirement: Sensor CRUD operations
The system SHALL provide administrative functionality to view, create, update, soft-delete, and reactivate sensor records via the backend REST API (`/api/sensors`).

#### Scenario: Admin views list of active sensors
- **WHEN** an authenticated administrator opens the sensor management page
- **THEN** the system requests `GET /api/sensors` and displays a table of sensors including UID, station name, type, coordinates, firmware version, connectivity status, assigned user ID, and last seen timestamp.

#### Scenario: Admin creates a new sensor
- **WHEN** an administrator submits the sensor registration form with UID, name, coordinates (latitude, longitude), and firmware version
- **THEN** the system sends `POST /api/sensors` with `CreateSensorRequest` (backend associates the sensor to the authenticated registering user) and adds the new sensor to the list upon receiving a 201 response.

#### Scenario: Admin updates an existing sensor
- **WHEN** an administrator modifies the name, coordinates, status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), or firmware version of a sensor and saves
- **THEN** the system sends `PUT /api/sensors/{id}` with `UpdateSensorRequest` and refreshes the sensor record.

#### Scenario: Admin sets sensor status to MAINTENANCE
- **WHEN** an administrator selects `MAINTENANCE` status for a sensor in the status control or edit modal
- **THEN** the system prompts for confirmation warning that automatic status changes will be disabled until manually updated by an admin, and only submits `PUT /api/sensors/{id}` with `{ "sensorStatus": "MAINTENANCE" }` upon confirmation.

#### Scenario: Admin deletes a sensor
- **WHEN** an administrator confirms the deletion of an active sensor
- **THEN** the system sends `DELETE /api/sensors/{id}`, marking the sensor inactive (`active: false`) and updating the UI state.

#### Scenario: Admin reactivates an inactive sensor
- **WHEN** an administrator clicks "Reactivate" on an inactive sensor and confirms
- **THEN** the system sends `PUT /api/sensors/{id}/reactivate`, marking the sensor active with status `OFFLINE`, and refreshes the sensor list.

## ADDED Requirements

### Requirement: Inactive sensor filtering and visibility
The system SHALL allow administrators to view and toggle between active and soft-deleted (inactive) sensors.

#### Scenario: Admin toggles inactive sensor view
- **WHEN** an administrator enables the inactive/deleted sensor filter or toggle
- **THEN** the sensor table displays inactive sensors, with inactive sensors displaying a "Reactivate" button instead of the "Delete" button.

#### Scenario: Regular user cannot view inactive sensors or admin actions
- **WHEN** a non-admin user views sensor lists or dashboards
- **THEN** the system displays only active sensors and hides all status editing, soft-delete, and reactivation controls.

### Requirement: Uniform status color indicators
The system SHALL visually represent the three sensor status states consistently across all UI views (table badges, status indicators, and map markers): `ONLINE` as green, `OFFLINE` as red, and `MAINTENANCE` as yellow.

#### Scenario: Render status badges with proper color coding
- **WHEN** a sensor record is displayed in the dashboard, management table, or interactive map
- **THEN** `ONLINE` is rendered with green badge/marker styling, `OFFLINE` with red badge/marker styling, and `MAINTENANCE` with yellow/amber badge/marker styling.
