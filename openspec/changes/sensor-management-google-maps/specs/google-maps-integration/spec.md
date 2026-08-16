## ADDED Requirements

### Requirement: Interactive Google Maps sensor visualization
The system SHALL render an interactive Google Map displaying sensor markers positioned at their geographic coordinates (`latitude`, `longitude`).

#### Scenario: Display sensor markers on map
- **WHEN** the Google Maps view is rendered
- **THEN** the system places custom markers on the map for all active sensors based on their coordinates.

#### Scenario: Color-coded marker status
- **WHEN** sensor markers are rendered on the map
- **THEN** sensors with `ONLINE` status display green markers, `OFFLINE` sensors display red markers, and `MAINTENANCE` sensors display yellow/orange markers.

---

### Requirement: Sensor map marker interaction and info window
The system SHALL display an informational window/card when a sensor marker on the Google Map is clicked.

#### Scenario: User clicks on a sensor marker
- **WHEN** a user clicks on a sensor marker on the map
- **THEN** an InfoWindow opens displaying station name, UID, status badge, coordinates, last seen timestamp, and quick action buttons.

---

### Requirement: Map coordinate picker for sensor creation and editing
The system SHALL provide an interactive map coordinate picker within the sensor registration and edit form.

#### Scenario: Admin clicks on map to set sensor location
- **WHEN** an admin clicks on the map coordinate picker during sensor creation or editing
- **THEN** the form's `latitude` and `longitude` fields are automatically populated with the selected coordinates and a draggable marker updates to that position.
