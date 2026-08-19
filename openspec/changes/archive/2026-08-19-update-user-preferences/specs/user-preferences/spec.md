## ADDED Requirements

### Requirement: User preference data model alignment
The system SHALL define user preferences adhering strictly to `Language` (`'ES' | 'EN'`) and `Theme` (`'DARK' | 'LIGHT' | 'SYSTEM'`) types and omit any `active` status field.

#### Scenario: User preference model typing
- **WHEN** user preference types are imported and used across services and components
- **THEN** `PreferenceResponse` and `UserPreference` include `id`, `language`, and `theme` properties without an `active` property

### Requirement: Fetch user preferences from backend
The system SHALL request user preferences from `GET /api/preferences/me` upon loading the preferences view and initialize the active UI theme and language accordingly.

#### Scenario: Retrieve user preferences successfully
- **WHEN** the user navigates to the `/preferences` page
- **THEN** `UserPreferenceService.getPreferences()` executes a GET request to `/api/preferences/me` with Bearer auth and initializes the local theme and language states

### Requirement: Update user preferences on backend
The system SHALL send partial preference updates (`UpdatePreferenceRequest` / `UpdatePreferencePayload`) via `PATCH /api/preferences/me` when the user selects a theme or language option.

#### Scenario: Update theme preference
- **WHEN** the user selects `'DARK'`, `'LIGHT'`, or `'SYSTEM'` in the preferences UI
- **THEN** the system applies the theme immediately and sends `PATCH /api/preferences/me` with `{ theme: <selected_theme> }`

#### Scenario: Update language preference
- **WHEN** the user selects `'ES'` or `'EN'` in the preferences UI
- **THEN** the system applies the runtime language immediately and sends `PATCH /api/preferences/me` with `{ language: <selected_language> }`

### Requirement: UI Preferences page presentation
The Preferences page SHALL display Theme and Language configuration cards without any Active/Inactive toggle control.

#### Scenario: Preferences view rendering
- **WHEN** the Preferences component renders
- **THEN** it displays the theme selector (SYSTEM, DARK, LIGHT) and language selector (ES, EN), and does not render any preference status or active switch
