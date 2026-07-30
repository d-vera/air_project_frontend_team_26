## ADDED Requirements

### Requirement: Application uses a sidebar layout shell
The system SHALL wrap all authenticated pages in a shell layout with a sidebar navigation panel and a top navbar. The sidebar SHALL contain navigation links, theme toggle, and language toggle.

#### Scenario: Desktop sidebar is visible
- **WHEN** the viewport width is greater than 1024px
- **THEN** the sidebar is permanently visible at 250px width alongside the main content area

#### Scenario: Tablet sidebar is overlay
- **WHEN** the viewport width is between 768px and 1024px
- **THEN** the sidebar is hidden by default and appears as an overlay with a backdrop when toggled via the hamburger menu

#### Scenario: Mobile sidebar is overlay
- **WHEN** the viewport width is less than 768px
- **THEN** the sidebar is hidden by default and appears as an overlay with a backdrop when toggled via the hamburger menu

### Requirement: Sidebar contains navigation links based on user role
The system SHALL display navigation links in the sidebar appropriate to the user's role.

#### Scenario: Registered user navigation
- **WHEN** a user with role `REGISTERED_USER` views the sidebar
- **THEN** the sidebar shows links to Dashboard and Profile

#### Scenario: Admin navigation
- **WHEN** a user with role `ADMIN` views the sidebar
- **THEN** the sidebar shows links to Dashboard, Profile, and User Management (admin section)

### Requirement: All pages are responsive
The system SHALL render correctly on mobile (≥320px), tablet (≥768px), and desktop (≥1024px) viewports. Forms, cards, and content areas SHALL adapt their layout using TailwindCSS responsive utilities.

#### Scenario: Login page on mobile
- **WHEN** the login page is viewed on a mobile device
- **THEN** the form is full-width with appropriate padding and all elements are stacked vertically

#### Scenario: User cards on mobile
- **WHEN** the admin user list is viewed on a mobile device
- **THEN** user cards stack in a single column layout

#### Scenario: User cards on desktop
- **WHEN** the admin user list is viewed on a desktop
- **THEN** user cards display in a responsive grid (2-3 columns)

### Requirement: Public pages do not show the sidebar
The system SHALL render login and register pages without the sidebar layout — they use a centered, full-page layout.

#### Scenario: Login page layout
- **WHEN** a user navigates to `/login`
- **THEN** the page renders a centered card/form without the sidebar or top navbar
