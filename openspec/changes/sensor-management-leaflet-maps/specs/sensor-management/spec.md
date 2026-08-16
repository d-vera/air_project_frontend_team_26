## ADDED Requirements

### Requirement: Sensor CRUD operations
The system SHALL provide administrative functionality to view, create, update, and soft-delete sensor records via the backend REST API (`/api/sensors`).

#### Scenario: Admin views list of active sensors
- **WHEN** an authenticated administrator opens the sensor management page
- **THEN** the system requests `GET /api/sensors` and displays a table of active sensors including UID, station name, type, coordinates, firmware version, connectivity status, assigned user ID, and last seen timestamp.

#### Scenario: Admin creates a new sensor
- **WHEN** an administrator submits the sensor registration form with UID, name, coordinates (latitude, longitude), firmware version, and optional assigned user
- **THEN** the system sends `POST /api/sensors` with `CreateSensorRequest` and adds the new sensor to the list upon receiving a 201 response.

#### Scenario: Admin updates an existing sensor
- **WHEN** an administrator modifies the name, coordinates, status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), firmware version, or assigned user of a sensor and saves
- **THEN** the system sends `PUT /api/sensors/{id}` with `UpdateSensorRequest` and refreshes the sensor record.

#### Scenario: Admin deletes a sensor
- **WHEN** an administrator confirms the deletion of a sensor
- **THEN** the system sends `DELETE /api/sensors/{id}` and removes/deactivates the sensor from the active view.

---

### Requirement: Sensor status and health filtering
The system SHALL support filtering and searching sensors by their connectivity status (`ONLINE`, `OFFLINE`, `MAINTENANCE`), hardware UID (`uidSensor`), and station name.

#### Scenario: Filter sensors by status
- **WHEN** an administrator filters the sensor list by status `ONLINE`
- **THEN** only sensors with `sensorStatus === 'ONLINE'` are displayed.

#### Scenario: Search sensors by UID or name
- **WHEN** an administrator types a search query matching a hardware UID or station name
- **THEN** the list updates dynamically to show only matching sensor stations.

---

### Requirement: Role-based access control for sensor management
The system SHALL restrict access to sensor creation, updating, and deletion actions exclusively to users with `ADMIN` privileges.

#### Scenario: Non-admin attempts to access sensor management route
- **WHEN** an unauthenticated visitor or non-admin user navigates to `/admin/sensors`
- **THEN** the auth guard redirects the user to the login or unauthorized page.
