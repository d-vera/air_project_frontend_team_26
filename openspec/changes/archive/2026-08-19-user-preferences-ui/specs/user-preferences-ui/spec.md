# user-preferences-ui Specification

## ADDED Requirements

### Requirement: User preference service communicates with dedicated preferences API
The frontend system SHALL communicate with `/api/preferences/me` for fetching and updating the authenticated user's UI preferences.

#### Scenario: Fetch user preferences on application load
- **WHEN** an authenticated user loads the application
- **THEN** the system issues a `GET /api/preferences/me` request with JWT bearer authorization and updates the client preference state

#### Scenario: Update user preferences partially
- **WHEN** a user modifies a preference field (language, theme, or active status)
- **THEN** the system issues a `PATCH /api/preferences/me` request with the updated fields and reflects changes in the application state

### Requirement: User preference settings component UI
The system SHALL provide a dedicated User Preferences UI page/component where users can view and update their preferred language (`ES`, `EN`), theme (`SYSTEM`, `DARK`, `LIGHT`), and active preference status.

#### Scenario: Change theme from preferences UI
- **WHEN** a user selects a new theme option (`SYSTEM`, `DARK`, or `LIGHT`) in the settings UI
- **THEN** the system updates the theme immediately and persists the choice to `PATCH /api/preferences/me`

#### Scenario: Change language from preferences UI
- **WHEN** a user selects a new language (`ES` or `EN`) in the settings UI
- **THEN** the system changes the UI language runtime translation immediately and persists the choice to `PATCH /api/preferences/me`

#### Scenario: Toggle active status from preferences UI
- **WHEN** a user toggles the active preference setting
- **THEN** the system sends `active: boolean` payload to `PATCH /api/preferences/me` and displays confirmation
