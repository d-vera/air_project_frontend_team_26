# i18n Specification

## MODIFIED Requirements

### Requirement: User can switch between Spanish and English
The system SHALL support Spanish (`ES`) and English (`EN`) preferences, dynamically switching runtime translations without page reload.

#### Scenario: Switch to Spanish
- **WHEN** a user selects Spanish (`ES`)
- **THEN** the system loads `assets/i18n/es.json`, updates UI text to Spanish, and saves `"es"` to `localStorage` under key `lang`

#### Scenario: Switch to English
- **WHEN** a user selects English (`EN`)
- **THEN** the system loads `assets/i18n/en.json`, updates UI text to English, and saves `"en"` to `localStorage` under key `lang`

### Requirement: Synchronize language preference with backend database
The system SHALL synchronize the authenticated user's language preference (`ES` or `EN`) with the backend API via `PATCH /api/preferences/me`.

#### Scenario: Authenticated user updates language
- **WHEN** an authenticated user selects a language preference
- **THEN** the system updates runtime language translation, saves `lang` to `localStorage`, and sends `PATCH /api/preferences/me` with payload `{"language": "ES"}` or `{"language": "EN"}`
