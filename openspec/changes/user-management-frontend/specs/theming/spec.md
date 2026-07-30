## ADDED Requirements

### Requirement: User can toggle between dark and light theme
The system SHALL provide a toggle button in the sidebar/navbar that switches between dark and light modes. The toggle SHALL apply immediately without page reload.

#### Scenario: Switch to dark mode
- **WHEN** a user clicks the theme toggle while in light mode
- **THEN** the system adds the `dark` class to the `<html>` element, saves `"dark"` to localStorage under key `theme`, and all UI elements update to dark colors

#### Scenario: Switch to light mode
- **WHEN** a user clicks the theme toggle while in dark mode
- **THEN** the system removes the `dark` class from the `<html>` element, saves `"light"` to localStorage under key `theme`, and all UI elements update to light colors

### Requirement: Theme preference persists across sessions
The system SHALL remember the user's theme choice by reading from localStorage on application startup.

#### Scenario: Returning user with saved preference
- **WHEN** a user with a saved theme preference loads the application
- **THEN** the system reads the `theme` key from localStorage and applies the saved theme before rendering

#### Scenario: New user without saved preference
- **WHEN** a user without a saved theme preference loads the application
- **THEN** the system checks the OS-level `prefers-color-scheme` media query and applies the matching theme
