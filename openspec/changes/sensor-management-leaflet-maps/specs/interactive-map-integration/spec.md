## ADDED Requirements

### Requirement: Interactive Leaflet map sensor visualization
The system SHALL render an interactive Leaflet map (using OpenStreetMap/Carto tiles) displaying sensor markers positioned at their geographic coordinates (`latitude`, `longitude`).

#### Scenario: Display sensor markers on map
- **WHEN** the interactive map view is rendered
- **THEN** the system places custom markers on the Leaflet map for all active sensors based on their coordinates.

#### Scenario: Color-coded marker status
- **WHEN** sensor markers are rendered on the map
- **THEN** sensors with `ONLINE` status display emerald green markers, `OFFLINE` sensors display red markers, and `MAINTENANCE` sensors display amber/orange markers.

---

### Requirement: Sensor map marker interaction and popup
The system SHALL display an informational popup/card when a sensor marker on the interactive map is clicked.

#### Scenario: User clicks on a sensor marker
- **WHEN** a user clicks on a sensor marker on the map
- **THEN** a Leaflet popup opens displaying station name, UID, status badge, coordinates, last seen timestamp, and quick action buttons.

---

### Requirement: Map coordinate picker for sensor creation and editing
The system SHALL provide an interactive Leaflet map coordinate picker within the sensor registration and edit form.

#### Scenario: Admin clicks on map to set sensor location
- **WHEN** an admin clicks on the map coordinate picker during sensor creation or editing
- **THEN** the form's `latitude` and `longitude` fields are automatically populated with the selected coordinates and a draggable marker updates to that position.

