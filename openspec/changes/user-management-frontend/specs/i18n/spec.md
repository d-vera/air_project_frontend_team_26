## ADDED Requirements

### Requirement: User can switch between Spanish and English
The system SHALL provide a language toggle in the sidebar/navbar that switches all UI text between Spanish and English at runtime without page reload.

#### Scenario: Switch to Spanish
- **WHEN** a user selects Spanish from the language toggle
- **THEN** the system loads `assets/i18n/es.json`, updates all visible text to Spanish, and saves `"es"` to localStorage under key `lang`

#### Scenario: Switch to English
- **WHEN** a user selects English from the language toggle
- **THEN** the system loads `assets/i18n/en.json`, updates all visible text to English, and saves `"en"` to localStorage under key `lang`

### Requirement: Language preference persists across sessions
The system SHALL remember the user's language choice by reading from localStorage on startup.

#### Scenario: Returning user with saved language
- **WHEN** a user with a saved language preference loads the application
- **THEN** the system reads the `lang` key from localStorage and loads the corresponding translation file

#### Scenario: New user without saved language
- **WHEN** a user without a saved language preference loads the application
- **THEN** the system checks the browser's `navigator.language` and defaults to Spanish if it starts with `es`, otherwise English

### Requirement: All user-facing text uses translation keys
The system SHALL use translation keys via `{{ 'KEY' | translate }}` pipe or `TranslateService.instant()` for all user-facing text. No hardcoded UI text SHALL exist in component templates.

#### Scenario: All text is translated
- **WHEN** the application renders any page
- **THEN** all visible text (labels, buttons, messages, placeholders, error messages) comes from translation files
