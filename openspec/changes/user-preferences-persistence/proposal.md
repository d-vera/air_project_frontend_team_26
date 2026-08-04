## Why

Currently, user UI preferences (Theme and Language) are stored only in browser `localStorage`. When a user logs in from a different browser or device, their preferences are lost and reset to defaults. To provide a seamless cross-device user experience, theme and language preferences must be persisted in the backend database via `PATCH /api/users/me/preferences` and synchronized upon authentication.

## What Changes

- Add backend API integration targeting `PATCH /api/users/me/preferences` (`UpdatePreferencesRequest`) to persist user UI preferences (`preferred_theme` and `preferred_language`).
- Update authentication and profile services to sync user preferences with the backend database upon login and preference changes.
- Modify theme and language services to synchronize state between backend API, `localStorage`, and runtime UI state.
- Ensure fallback to `localStorage` and system defaults for unauthenticated users or when offline.

## Capabilities

### New Capabilities
<!-- None -->

### Modified Capabilities
- `theming`: Synchronize user theme preference (`DARK` / `LIGHT`) with backend `preferred_theme` via `PATCH /api/users/me/preferences` for authenticated users while maintaining `localStorage` fallback.
- `i18n`: Synchronize user language preference (`es` / `en`) with backend `preferred_language` via `PATCH /api/users/me/preferences` for authenticated users while maintaining `localStorage` fallback.

## Impact

- Frontend services: `ThemeService`, `LanguageService`, `AuthService`, `UserService`.
- REST API endpoint integration: `PATCH /api/users/me/preferences` and `GET /api/users/me`.
- Data models: `UserResponse`, `UpdatePreferencesRequest`.
