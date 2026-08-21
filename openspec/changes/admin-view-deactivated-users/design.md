## Context

The backend `GET /api/users` now returns ALL users (both `active: true` and `active: false`). The `PUT /api/users/{id}` endpoint now accepts an optional `active` boolean field in the request body (`UpdateUserRequest`), allowing admins to explicitly reactivate deactivated users by sending `{ "active": true }`.

The current frontend implementation has the UI components in place (status filter tabs, status badges, reactivation modal, deactivation modal, toast feedback), but the reactivation API call in `confirmActivate()` only sends `{ firstName, lastName }` without including `active: true`. The `UpdateUserRequest` TypeScript interface also lacks the `active` field, so the model is out of sync with the backend contract.

### Updated Backend API Contracts (from Swagger `/v3/api-docs`)

- **`GET /api/users`**: Returns all users including inactive accounts. Response: `UserResponse[]` with `active: boolean`.
- **`GET /api/users/{id}`**: Returns user regardless of active status.
- **`PUT /api/users/{id}`**: Request body `UpdateUserRequest` now includes optional `active: boolean`. Sending `{ "active": true }` reactivates a deactivated user.
- **`DELETE /api/users/{id}`**: Soft-delete — sets `active = false`. Unchanged.

## Goals / Non-Goals

**Goals:**
- Update the `UpdateUserRequest` TypeScript interface to include `active?: boolean`, matching the backend contract.
- Fix the `confirmActivate()` method in `UserListComponent` to send `{ active: true }` in the PUT request body, ensuring proper reactivation via the backend.
- Maintain all existing UI functionality: status filter tabs, status badges, metric counters, confirmation modals, and toast feedback.
- Preserve full i18n support in English and Spanish.

**Non-Goals:**
- Adding new UI elements or filter mechanisms (the UI is already built and functional).
- Modifying backend endpoints (all changes are backend-complete).
- Hard-deleting users (soft-delete/deactivation is the system design).

## Decisions

1. **Add `active?: boolean` to `UpdateUserRequest` interface**:
   - The backend `UpdateUserRequest` schema now includes `active` as an optional boolean. The frontend TypeScript interface must mirror this.
   - *Alternative considered*: Creating a separate `ReactivateUserRequest` type. *Rationale*: Not needed since the backend uses a single unified `UpdateUserRequest` schema for all PUT updates including reactivation.

2. **Send `{ active: true }` in `confirmActivate()` instead of `{ firstName, lastName }`**:
   - The current implementation sends `{ firstName: u.firstName, lastName: u.lastName }` which may have worked incidentally but does not explicitly set the `active` flag. The backend now expects `active: true` to reactivate.
   - Sending only `{ active: true }` is sufficient since all fields in `UpdateUserRequest` are optional — the backend will only update fields that are present.
   - *Alternative considered*: Sending both `{ active: true, firstName, lastName }`. *Rationale*: Unnecessary since fields not included are simply not updated. Sending only `{ active: true }` is cleaner and avoids unintended field overwrites.

3. **No changes to existing UI components, templates, or translations**:
   - The user list component already has: status filter tabs, metric counter badges, active/inactive status badges on cards, reactivation confirmation modal, deactivation confirmation modal, and toast notifications. All translation keys are already defined in both `en.json` and `es.json`.
   - This change is purely a model alignment and API call fix.

## Risks / Trade-offs

- [Risk] Sending only `{ active: true }` without `firstName`/`lastName` could overwrite existing fields if the backend treats missing fields as null.
  - *Mitigation*: Confirmed via Swagger docs that all `UpdateUserRequest` fields are optional — the backend only updates fields explicitly provided in the request body.
