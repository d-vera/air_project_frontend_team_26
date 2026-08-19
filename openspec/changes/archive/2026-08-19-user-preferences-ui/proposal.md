## Why

The backend has extracted user preferences into a dedicated backend service and database table (`user_preferences`) with a new API endpoint contract (`/api/preferences/me`). The frontend needs to be updated to integrate with these dedicated endpoints, support the new `SYSTEM` theme mode with dynamic OS color-scheme detection, support `language` enum (`ES` / `EN`), and provide a dedicated User Preferences UI settings component and state management.

## What Changes

- **NEW API Integration**: Replace user preference calls to `/api/users/me/preferences` with dedicated `GET /api/preferences/me` and `PATCH /api/preferences/me` endpoints.
- **Data Models**: Add `UserPreference` model interface with `id`, `language` (`'ES'` | `'EN'`), `theme` (`'DARK'` | `'LIGHT'` | `'SYSTEM'`), and `active` (`boolean`).
- **System Theme Support**: Update `ThemeService` to support `'SYSTEM'` mode, which dynamically tracks OS color scheme (`window.matchMedia('(prefers-color-scheme: dark)')`) with event listeners.
- **Preference Service & State Management**: Create/update dedicated `PreferenceService` (or update existing `ThemeService`/`LanguageService`) to load and patch user preferences on authenticated login and preference changes.
- **Preferences UI Component**: Implement a modern, user-friendly Preference Settings page/component in Angular allowing users to customize language, theme mode, and view preference status.
- **App Routes**: Wire the Preference Settings UI component into the application layout/routing (e.g. `/dashboard/preferences` or inside user profile).

## Capabilities

### New Capabilities
- `user-preferences-ui`: Implement dedicated frontend user preference settings UI component, preference service, and state management consuming `/api/preferences/me`.

### Modified Capabilities
- `theming`: Update theme capabilities to support `SYSTEM` mode (dynamic OS media query tracking) alongside `DARK` and `LIGHT`, persisting to `/api/preferences/me`.
- `i18n`: Update language persistence model to sync upper-case `ES` / `EN` preference payload with backend `/api/preferences/me`.

## Impact

- **Frontend Services**: `ThemeService`, `LanguageService`, `UserService`, and new `UserPreferenceService`.
- **Frontend Models**: `src/app/models/user-preference.model.ts` (or `user.model.ts`).
- **Frontend Components**: New `PreferencesComponent` setting component, updated navigation/profile links.
- **API Communication**: Switches preference GET/PATCH requests to `/api/preferences/me`.
