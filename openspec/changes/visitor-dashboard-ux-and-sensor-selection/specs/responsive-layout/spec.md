## ADDED Requirements

### Requirement: Sidebar displays visitor identity and login action when unauthenticated
The system SHALL display a visitor identity badge and a login action in the sidebar when the user is not authenticated, hiding authenticated-only controls.

#### Scenario: Visitor views sidebar identity and footer actions
- **WHEN** an unauthenticated visitor views the sidebar (desktop or mobile slide-over)
- **THEN** the sidebar displays a translated `"Visitor"` (`"Visitante"`) label with a public-access indicator instead of `"User"` / `"Registered User"`, hides the `"Log Out"` button, and displays a `"Log In"` button that navigates to `/login`

## MODIFIED Requirements

### Requirement: Sidebar contains navigation links based on user role
The system SHALL display navigation links in the sidebar appropriate to the user's authentication state and role.

#### Scenario: Visitor navigation
- **WHEN** an unauthenticated visitor views the sidebar
- **THEN** the sidebar shows only the link to Dashboard and hides links to Profile, Preferences, Reports, and Admin sections

#### Scenario: Registered user navigation
- **WHEN** a user with role `REGISTERED_USER` views the sidebar
- **THEN** the sidebar shows links to Dashboard, Profile, Preferences, and Reports

#### Scenario: Admin navigation
- **WHEN** a user with role `ADMIN` views the sidebar
- **THEN** the sidebar shows links to Dashboard, Profile, Preferences, Reports, and Administration links (User Management and Sensor Management)

