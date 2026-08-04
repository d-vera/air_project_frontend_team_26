## Context

The backend has updated the `users` table schema to store user UI preferences with `preferred_theme` (`DARK` / `LIGHT`, default `DARK`) and `preferred_language` (`es` / `en`, default `es`), exposing `GET /api/users/me` to read profile data and a dedicated endpoint `PATCH /api/users/me/preferences` (`UpdatePreferencesRequest`) to update preferences. Currently, the Angular frontend manages theme and language preferences in `localStorage` via `ThemeService` and `LanguageService`.

To synchronize these preferences across devices, the frontend must fetch profile data from `GET /api/users/me` upon login/app launch and send preference updates to `PATCH /api/users/me/preferences` whenever the user updates their theme or language settings.

## Goals / Non-Goals

**Goals:**
- Extend user models (`UserResponse`, `UpdatePreferencesRequest`) to include `preferredTheme` and `preferredLanguage`.
- Update `UserService` to include `updatePreferences(data: UpdatePreferencesRequest)` targeting `PATCH /api/users/me/preferences`.
- Update `ThemeService` and `LanguageService` to support loading and persisting preferences from/to the backend API for authenticated users via `PATCH /api/users/me/preferences`.
- Implement immediate optimistic UI updates while asynchronously pushing preference updates to the backend DB.
- Maintain `localStorage` caching to eliminate visual flashes (FOUC / content shifts) during initial application bootstrap.

**Non-Goals:**
- Modifying backend migrations or database schema (already applied on backend).
- Changing theme or language options beyond `DARK`/`LIGHT` and `es`/`en`.

## Decisions

### 1. Dedicated Preferences Endpoint (`PATCH /api/users/me/preferences`)
TypeScript models in `src/app/models/user.model.ts` will declare `UpdatePreferencesRequest`:
- `preferredTheme?: 'DARK' | 'LIGHT';`
- `preferredLanguage?: 'es' | 'en';`

And `UserService` will send `PATCH /api/users/me/preferences` requests using `UpdatePreferencesRequest`.

Rationale: The backend OpenAPI spec defines `PATCH /api/users/me/preferences` specifically for updating user UI preferences (`UpdatePreferencesRequest`).

### 2. Optimistic UI Updates & Asynchronous Persistence
When a user toggles theme or language:
1. Update active UI state (`signal`) and write to `localStorage` immediately.
2. If authenticated, fire an asynchronous `UserService.updatePreferences({ preferredTheme, preferredLanguage })` request to `PATCH /api/users/me/preferences`.
3. If API fails, log warning silently without blocking or reverting UI state.

Rationale: Provides zero latency response for UI interactions while syncing state in the background.

### 3. Preference Bootstrap Flow on Auth State Change
When an authenticated user loads the app or logs in:
1. `ThemeService` and `LanguageService` load existing values from `localStorage` immediately.
2. Auth/User workflow calls `/api/users/me` to retrieve server-side preferences.
3. If server-side preferences differ from `localStorage`, update UI signals and sync `localStorage`.

## Risks / Trade-offs

- [Risk] Server preferences overwrite user local choices if user changes setting while offline.
  → Mitigation: Sync `localStorage` with server response only after successful authentication or explicit user fetch.
- [Risk] Rapid toggle actions sending multiple API updates.
  → Mitigation: Send preference updates on toggle while letting HttpClient handle pipeline execution.

## Migration Plan

1. Update `UserResponse` and add `UpdatePreferencesRequest` in `src/app/models/user.model.ts`.
2. Update `UserService` with `updatePreferences(data: UpdatePreferencesRequest)` targeting `PATCH /api/users/me/preferences`.
3. Update `ThemeService` to call `updatePreferences({ preferredTheme })` on theme toggle.
4. Update `LanguageService` to call `updatePreferences({ preferredLanguage })` on language change.
5. Update `AuthService` to load preferences from `/api/users/me` after login.
