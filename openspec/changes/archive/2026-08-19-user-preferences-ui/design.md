## Context

The backend extracted user UI preferences into a dedicated service/table (`user_preferences`) and exposed two new endpoints under `/api/preferences`:
- `GET /api/preferences/me`: Fetches preferences for the authenticated user.
- `PATCH /api/preferences/me`: Partially updates preference fields (`language`, `theme`, `active`).

The current frontend uses legacy endpoints (`/api/users/me/preferences`), lacks support for `SYSTEM` theme mode (dynamic OS color scheme), only handles binary theme toggling (`DARK` / `LIGHT`), and does not have a dedicated Preference Settings UI view.

## Goals / Non-Goals

**Goals:**
- Implement `UserPreference` interfaces (`UserPreference`, `UpdatePreferenceRequest`, `ThemePreference`, `LanguagePreference`).
- Implement `UserPreferenceService` to interact with `/api/preferences/me` (`GET`, `PATCH`).
- Update `ThemeService` to support `'SYSTEM'`, `'DARK'`, and `'LIGHT'` modes:
  - If `'SYSTEM'`, dynamically evaluate `window.matchMedia('(prefers-color-scheme: dark)')` and attach event listeners to handle live OS theme updates.
- Update `LanguageService` to map backend `'ES'`/`'EN'` enums to `@ngx-translate/core` translation assets (`es`/`en`).
- Build a modern Angular `PreferencesComponent` allowing users to view and update theme, language, and active preference state.
- Integrate preferences routing under `/dashboard/preferences` (and/or Profile tab).

**Non-Goals:**
- Creating custom backend endpoints (backend contract is finalized).
- Changing database schemas or server-side entity definitions.

## Decisions

### 1. Dedicated `UserPreferenceService` vs `UserService`
- **Choice**: Create `UserPreferenceService` in `src/app/core/services/user-preference.service.ts`.
- **Rationale**: Aligns with backend architectural separation (`/api/preferences/me` vs `/api/users/me`). Keeps concerns focused and modular.
- **Alternatives Considered**: Modifying `UserService`. Rejected because it creates tight coupling with user account management.

### 2. Dynamic `SYSTEM` Theme Handling
- **Choice**: Store user preference as `'SYSTEM' | 'DARK' | 'LIGHT'`. When set to `'SYSTEM'`, evaluate `window.matchMedia('(prefers-color-scheme: dark)')` and listen to `change` events.
- **Rationale**: Meets requirement 3.A for `SYSTEM` mode to respond dynamically to system OS changes.
- **Alternatives Considered**: Static check on page load only. Rejected because theme wouldn't update when OS changes themes while the app is open.

### 3. Case Mapping for Language Enum
- **Choice**: `LanguagePreference` uses `'ES' | 'EN'` for backend payload, converted to lowercase `'es' | 'en'` for `@ngx-translate/core`.
- **Rationale**: Backend API contract strictly expects `"ES"` or `"EN"`, while translation loaders use lowercase file names (`es.json`, `en.json`).

### 4. Preference Settings UI Component
- **Choice**: Implement `PreferencesComponent` as an Angular standalone component inside `src/app/features/preferences/preferences.component.ts` with template, styles, and reactive signals/forms.

## Risks / Trade-offs

- **[Risk]**: Unauthenticated initial load attempting backend sync.
  → **Mitigation**: `UserPreferenceService` will only fetch `/api/preferences/me` when an auth token is present, falling back gracefully to local storage and OS defaults.
- **[Risk]**: System media query listener leaks across navigation.
  → **Mitigation**: Clean up event listeners on service/scope destruction or re-configuration.

## Migration Plan

1. Add `UserPreference` models and `UserPreferenceService`.
2. Refactor `ThemeService` and `LanguageService` to use `UserPreferenceService` and backend contract `/api/preferences/me`.
3. Build `PreferencesComponent` and add route `/dashboard/preferences`.
4. Add link to Preferences in header/sidebar navigation.
