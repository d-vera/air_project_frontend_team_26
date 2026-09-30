# admin-user-management Specification

## Purpose
TBD - created by archiving change user-management-frontend. Update Purpose after archive.
## Requirements
### Requirement: Admin can list all active users
The system SHALL display all users in a card-based layout by calling `GET /api/users`. The system SHALL allow administrators to filter the list by status (`ALL`, `ACTIVE`, `INACTIVE` / deactivated) and search term. Each card SHALL clearly display the user's name, email, role, and active/inactive status with corresponding action buttons.

#### Scenario: View user list
- **WHEN** an admin navigates to the admin users page
- **THEN** the system calls `GET /api/users` and renders users matching the selected status filter and search query, displaying count metrics for total, active, and deactivated users

#### Scenario: Filter by deactivated users
- **WHEN** an admin selects the "Deactivated" / "Inactive" filter tab
- **THEN** the system displays only inactive/deactivated users with options to view details or re-enable/activate them

#### Scenario: Empty user list
- **WHEN** an admin views the user list and no users match the current filter or search query
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
The system SHALL provide actions to soft-delete (deactivate) an active user via `DELETE /api/users/{id}` or reactivate/enable an inactive user via `PUT /api/users/{id}` with `{ "active": true }` in the request body. Both actions SHALL provide confirmation dialogs and immediate visual feedback.

#### Scenario: Deactivate a user
- **WHEN** an admin clicks the deactivate button on an active user and confirms the action in the modal
- **THEN** the system calls `DELETE /api/users/{id}`, updates the user's status in the UI, and displays a translated deactivation confirmation toast

#### Scenario: Reactivate/Enable an inactive user
- **WHEN** an admin clicks the activate/enable button on a deactivated user and confirms the action in the modal
- **THEN** the system calls `PUT /api/users/{id}` with `{ "active": true }` in the request body, marks the user as active in the UI, and displays a translated activation confirmation toast

#### Scenario: Admin cancels deactivation or reactivation
- **WHEN** an admin opens the confirmation dialog for deactivate or activate but clicks cancel
- **THEN** no API call is made and the user's status remains unchanged

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

### Requirement: UpdateUserRequest model alignment
The frontend `UpdateUserRequest` TypeScript interface SHALL include an optional `active: boolean` field to match the backend API contract for `PUT /api/users/{id}`.

#### Scenario: Interface supports active status payload
- **WHEN** components or services prepare a payload for updating a user's active state
- **THEN** the `UpdateUserRequest` interface permits `{ active: boolean }` without TypeScript compilation errors

