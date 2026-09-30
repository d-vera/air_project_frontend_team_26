## 1. Model & Interface Alignment

- [x] 1.1 Add `active?: boolean` to the `UpdateUserRequest` interface in `src/app/models/user.model.ts` to match the backend `PUT /api/users/{id}` contract.

## 2. Reactivation API Call Fix

- [x] 2.1 Update `confirmActivate()` in `src/app/features/admin/user-list/user-list.component.ts` to call `userService.updateUser(u.id, { active: true })` instead of `{ firstName: u.firstName, lastName: u.lastName }`.

## 3. Verification & Testing

- [x] 3.1 Verify that clicking "Reactivate" on an inactive user sends `PUT /api/users/{id}` with `{ "active": true }` and the user becomes active in the UI.
- [x] 3.2 Verify that the reactivation confirmation modal and success toast still work correctly.
- [x] 3.3 Verify that status filters (All, Active, Deactivated) display correct user subsets after reactivation.
- [x] 3.4 Verify that deactivation workflow (DELETE) is unaffected.
