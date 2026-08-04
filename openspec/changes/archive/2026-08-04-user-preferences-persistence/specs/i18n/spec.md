## ADDED Requirements

### Requirement: Synchronize language preference with backend database
The system SHALL synchronize the authenticated user's language preference (`es` or `en`) with the backend API via `PATCH /api/users/me/preferences`.

#### Scenario: Authenticated user changes language
- **WHEN** an authenticated user selects a new language from the language selector
- **THEN** the system updates active UI language, saves language to `localStorage`, and sends a `PATCH /api/users/me/preferences` request to persist `preferredLanguage` in the backend database

#### Scenario: User logs in with saved backend language
- **WHEN** a user successfully logs in
- **THEN** the system fetches user profile preferences from `GET /api/users/me` and applies `preferredLanguage` (`es` or `en`) to the application and syncs `localStorage`

## MODIFIED Requirements

### Requirement: Language preference persists across sessions
The system SHALL remember the user's language choice by restoring `preferred_language` from the backend profile for authenticated users, falling back to `localStorage` and browser locale settings.

#### Scenario: Authenticated returning user with backend preference
- **WHEN** an authenticated user loads the application
- **THEN** the system applies the `preferredLanguage` returned from their backend profile (`GET /api/users/me`), loads translation files, and updates `localStorage`

#### Scenario: Unauthenticated returning user with saved language
- **WHEN** an unauthenticated user with a saved language preference loads the application
- **THEN** the system reads the `lang` key from `localStorage` and loads the corresponding translation file

#### Scenario: New user without saved language
- **WHEN** a new user without a saved language preference loads the application
- **THEN** the system checks the browser's `navigator.language` and defaults to Spanish if it starts with `es`, otherwise English
