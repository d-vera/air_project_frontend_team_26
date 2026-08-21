## Why

Administrators need full visibility over all user accounts, including deactivated/inactive users, in order to audit accounts and reactivate users when appropriate. The backend `GET /api/users` endpoint has been updated to return ALL users (both `active: true` and `active: false`), and `PUT /api/users/{id}` now supports an explicit `active` field in the request body for reactivation. The frontend must be updated to align with these backend API contract changes and provide a complete activate/deactivate workflow.

## What Changes

- Update the `UpdateUserRequest` TypeScript interface to include the optional `active: boolean` field, matching the updated backend `PUT /api/users/{id}` contract.
- Fix the reactivation API call in `UserListComponent.confirmActivate()` to send `{ active: true }` in the `PUT /api/users/{id}` request body, instead of only `{ firstName, lastName }`.
- Display the `active` status for each user in the admin user list table with visual badges ("Active" in green, "Inactive" in red).
- Provide status filter controls (All, Active, Deactivated) with count metrics so admins can isolate user subsets instantly.
- Show a "Reactivate" button for inactive users and a "Deactivate" button for active users with confirmation modals and toast feedback.
- Ensure i18n support in both English and Spanish for all status filters, modals, and toast messages.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `admin-user-management`: Update requirements so the reactivation flow sends `{ active: true }` via `PUT /api/users/{id}`, the `UpdateUserRequest` model includes the `active` field, and admins can list/filter all users by status and reactivate deactivated users with confirmation and feedback.

## Impact

- Model: `src/app/models/user.model.ts` — add `active?: boolean` to `UpdateUserRequest`.
- Component: `src/app/features/admin/user-list/user-list.component.ts` — fix `confirmActivate()` to send `{ active: true }`.
- Localization: `src/assets/i18n/en.json` and `src/assets/i18n/es.json` (already complete from prior work).
- Specs: Delta spec for `admin-user-management`.
