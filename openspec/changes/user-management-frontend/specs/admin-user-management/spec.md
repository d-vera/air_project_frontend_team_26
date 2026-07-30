## ADDED Requirements

### Requirement: Admin can list all active users
The system SHALL display all active users in a card-based layout by calling `GET /api/users`. Each card SHALL show the user's name, email, role, and status.

#### Scenario: View user list
- **WHEN** an admin navigates to the admin users page
- **THEN** the system calls `GET /api/users` and renders each user as a card showing name, email, role, active status, and action buttons

#### Scenario: Empty user list
- **WHEN** an admin views the user list and no users exist
- **THEN** the system displays a translated "No users found" message

### Requirement: Admin can view a specific user
The system SHALL display a detailed user view by calling `GET /api/users/{id}`, showing all user fields including timestamps.

#### Scenario: View user detail
- **WHEN** an admin clicks on a user card
- **THEN** the system navigates to `/admin/users/:id` and displays the full user profile (id, email, firstName, lastName, role, active, createdAt, updatedAt)

#### Scenario: User not found
- **WHEN** an admin navigates to a user detail page for a non-existent user
- **THEN** the system displays a translated "User not found" message (HTTP 404)

### Requirement: Admin can edit a user
The system SHALL provide a form to update a user's first name, last name, and password via `PUT /api/users/{id}`.

#### Scenario: Successful user edit
- **WHEN** an admin modifies a user's details and submits the form
- **THEN** the system calls `PUT /api/users/{id}` and displays a translated success message

#### Scenario: Invalid user edit
- **WHEN** an admin submits an edit with a password shorter than 8 characters
- **THEN** the system displays inline validation errors

### Requirement: Admin can activate or deactivate a user
The system SHALL provide a toggle or button to soft-delete (deactivate) a user via `DELETE /api/users/{id}`. The action SHALL require confirmation.

#### Scenario: Deactivate a user
- **WHEN** an admin clicks the deactivate button on an active user and confirms the action
- **THEN** the system calls `DELETE /api/users/{id}` and updates the user's status in the UI

#### Scenario: Admin cancels deactivation
- **WHEN** an admin clicks the deactivate button but cancels the confirmation dialog
- **THEN** no API call is made and the user remains active

### Requirement: Admin can assign roles
The system SHALL provide a role selector to assign `REGISTERED_USER` or `ADMIN` role to a user via `PUT /api/users/{id}/role`.

#### Scenario: Assign admin role
- **WHEN** an admin changes a user's role to `ADMIN` and confirms
- **THEN** the system calls `PUT /api/users/{id}/role` with `{ "role": "ADMIN" }` and updates the UI

#### Scenario: Assign registered user role
- **WHEN** an admin changes a user's role to `REGISTERED_USER` and confirms
- **THEN** the system calls `PUT /api/users/{id}/role` with `{ "role": "REGISTERED_USER" }` and updates the UI

### Requirement: Non-admin users cannot access admin pages
The system SHALL protect admin routes with a guard that redirects non-admin users.

#### Scenario: Non-admin access to admin route
- **WHEN** a user with role `REGISTERED_USER` navigates to `/admin/users`
- **THEN** the system redirects them to `/dashboard`

#### Scenario: Admin access to admin route
- **WHEN** a user with role `ADMIN` navigates to `/admin/users`
- **THEN** the system allows access and renders the admin panel
