# theming Specification

## MODIFIED Requirements

### Requirement: User can toggle between theme modes
The system SHALL provide theme controls that allow users to select between `SYSTEM`, `DARK`, and `LIGHT` mode. Theme updates SHALL apply immediately without requiring a full page reload.

#### Scenario: Switch to SYSTEM mode
- **WHEN** a user selects `SYSTEM` theme mode
- **THEN** the system checks `window.matchMedia('(prefers-color-scheme: dark)')` to apply dark or light mode based on OS settings and listens for live OS theme change events

#### Scenario: Switch to DARK mode
- **WHEN** a user selects `DARK` theme mode
- **THEN** the system adds the `dark` class to `<html>`, updates `localStorage`, and updates UI elements to dark styling regardless of OS theme

#### Scenario: Switch to LIGHT mode
- **WHEN** a user selects `LIGHT` theme mode
- **THEN** the system removes the `dark` class from `<html>`, updates `localStorage`, and updates UI elements to light styling regardless of OS theme

### Requirement: Synchronize theme preference with backend database
The system SHALL synchronize the authenticated user's theme preference (`SYSTEM`, `DARK`, or `LIGHT`) with the backend API via `PATCH /api/preferences/me`.

#### Scenario: Authenticated user updates theme
- **WHEN** an authenticated user changes their theme preference
- **THEN** the system updates UI theme rendering, saves theme choice to `localStorage`, and sends `PATCH /api/preferences/me` with payload `{"theme": "<MODE>"}`
