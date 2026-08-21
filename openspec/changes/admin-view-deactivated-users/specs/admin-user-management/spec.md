## MODIFIED Requirements

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

### Requirement: UpdateUserRequest model alignment
The frontend `UpdateUserRequest` TypeScript interface SHALL include an optional `active: boolean` field to match the backend API contract for `PUT /api/users/{id}`.
