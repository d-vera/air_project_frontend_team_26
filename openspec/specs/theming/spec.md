# theming Specification

## Purpose
Manage UI theme modes (Dark, Light, System) and synchronize theme preferences with backend storage.

## Requirements

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

### Requirement: Theme preference persists across sessions
The system SHALL remember the user's theme choice by restoring `preferred_theme` from the backend profile for authenticated users, falling back to `localStorage` and OS preferences.

#### Scenario: Authenticated returning user with backend preference
- **WHEN** an authenticated user loads the application
- **THEN** the system applies the `preferredTheme` returned from their backend profile (`GET /api/users/me`) and updates `localStorage`

#### Scenario: Unauthenticated returning user with saved preference
- **WHEN** an unauthenticated user with a saved theme preference loads the application
- **THEN** the system reads the `theme` key from `localStorage` and applies the saved theme before rendering

#### Scenario: New user without saved preference
- **WHEN** a new user without a saved theme preference loads the application
- **THEN** the system checks the OS-level `prefers-color-scheme` media query and applies the matching theme

### Requirement: Synchronize theme preference with backend database
The system SHALL synchronize the authenticated user's theme preference (`SYSTEM`, `DARK`, or `LIGHT`) with the backend API via `PATCH /api/preferences/me`.

#### Scenario: Authenticated user updates theme
- **WHEN** an authenticated user changes their theme preference
- **THEN** the system updates UI theme rendering, saves theme choice to `localStorage`, and sends `PATCH /api/preferences/me` with payload `{"theme": "<MODE>"}`

#### Scenario: User logs in with saved backend theme
- **WHEN** a user successfully logs in
- **THEN** the system fetches user profile preferences from `GET /api/users/me` and applies `preferredTheme` (`DARK`, `LIGHT`, or `SYSTEM`) to the application and syncs `localStorage`


