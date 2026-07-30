## ADDED Requirements

### Requirement: User can view their own profile
The system SHALL display the authenticated user's profile data (email, first name, last name, role, created date) by calling `GET /api/users/me`.

#### Scenario: View own profile
- **WHEN** an authenticated user navigates to the profile page
- **THEN** the system displays their email, first name, last name, role, and account creation date

### Requirement: User can update their own profile
The system SHALL provide a form allowing the authenticated user to update their first name, last name, and password via `PUT /api/users/me`.

#### Scenario: Successful profile update
- **WHEN** an authenticated user modifies their first name, last name, or password and submits the form
- **THEN** the system calls `PUT /api/users/me` and displays a translated success message

#### Scenario: Invalid profile update
- **WHEN** an authenticated user submits a profile update with a password shorter than 8 characters
- **THEN** the system displays an inline validation error and does not call the API

#### Scenario: Password field is optional
- **WHEN** an authenticated user updates their profile without entering a new password
- **THEN** the system sends only firstName and lastName, leaving the password unchanged
