## ADDED Requirements

### Requirement: Synchronize theme preference with backend database
The system SHALL synchronize the authenticated user's theme preference (`DARK` or `LIGHT`) with the backend API via `PATCH /api/users/me/preferences`.

#### Scenario: Authenticated user toggles theme
- **WHEN** an authenticated user changes their theme preference
- **THEN** the system updates the UI theme, saves the theme to `localStorage`, and sends a `PATCH /api/users/me/preferences` request to persist `preferredTheme` in the backend database

#### Scenario: User logs in with saved backend theme
- **WHEN** a user successfully logs in
- **THEN** the system fetches user profile preferences from `GET /api/users/me` and applies `preferredTheme` (`DARK` or `LIGHT`) to the application and syncs `localStorage`

## MODIFIED Requirements

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
