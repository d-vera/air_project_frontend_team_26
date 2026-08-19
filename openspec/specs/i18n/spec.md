# i18n Specification

## Purpose
Manage runtime language switching and synchronization between frontend and backend.

## Requirements

### Requirement: User can switch between Spanish and English
The system SHALL support Spanish (`ES`) and English (`EN`) preferences, dynamically switching runtime translations without page reload.

#### Scenario: Switch to Spanish
- **WHEN** a user selects Spanish (`ES`)
- **THEN** the system loads `assets/i18n/es.json`, updates UI text to Spanish, and saves `"es"` to `localStorage` under key `lang`

#### Scenario: Switch to English
- **WHEN** a user selects English (`EN`)
- **THEN** the system loads `assets/i18n/en.json`, updates UI text to English, and saves `"en"` to `localStorage` under key `lang`

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

### Requirement: All user-facing text uses translation keys
The system SHALL use translation keys via `{{ 'KEY' | translate }}` pipe or `TranslateService.instant()` for all user-facing text. No hardcoded UI text SHALL exist in component templates.

#### Scenario: All text is translated
- **WHEN** the application renders any page
- **THEN** all visible text (labels, buttons, messages, placeholders, error messages) comes from translation files

### Requirement: Synchronize language preference with backend database
The system SHALL synchronize the authenticated user's language preference (`ES` or `EN`) with the backend API via `PATCH /api/preferences/me`.

#### Scenario: Authenticated user updates language
- **WHEN** an authenticated user selects a language preference
- **THEN** the system updates runtime language translation, saves `lang` to `localStorage`, and sends `PATCH /api/preferences/me` with payload `{"language": "ES"}` or `{"language": "EN"}`

#### Scenario: User logs in with saved backend language
- **WHEN** a user successfully logs in
- **THEN** the system fetches user profile preferences and applies `preferredLanguage` (`es` or `en`) to the application and syncs `localStorage`


