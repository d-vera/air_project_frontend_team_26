## 1. Data Models & Preference Service Infrastructure

- [x] 1.1 Create `UserPreference` interfaces (`UserPreference`, `UpdatePreferencePayload`, `ThemePreference`, `LanguagePreference`) in `src/app/models/user-preference.model.ts`.
- [x] 1.2 Implement `UserPreferenceService` in `src/app/core/services/user-preference.service.ts` for `GET /api/preferences/me` and `PATCH /api/preferences/me`.
- [x] 1.3 Update `ThemeService` (`src/app/core/services/theme.service.ts`) to support `SYSTEM`, `DARK`, and `LIGHT` modes with dynamic OS `prefers-color-scheme` listener.
- [x] 1.4 Update `LanguageService` (`src/app/core/services/language.service.ts`) to handle `ES` and `EN` preference payload mapping with `@ngx-translate/core`.

## 2. User Preference UI Component & Routing Integration

- [x] 2.1 Create standalone Angular `PreferencesComponent` (`src/app/features/preferences/preferences.component.ts`) with form controls for theme, language, and active preference state.
- [x] 2.2 Add CSS styling and responsive layout for `PreferencesComponent` (`src/app/features/preferences/preferences.component.css`).
- [x] 2.3 Update `app.routes.ts` to add the `/dashboard/preferences` route protected by `authGuard`.
- [x] 2.4 Update Shell/Header navigation bar to include direct access link to Preference Settings.

## 3. Verification & Build Validation

- [x] 3.1 Verify initial preference fetch and fallback handling when authenticated.
- [x] 3.2 Verify theme switching (`SYSTEM`, `DARK`, `LIGHT`) and OS color scheme change listener in `SYSTEM` mode.
- [x] 3.3 Verify language switching between `ES` and `EN` and UI translation updates.
- [x] 3.4 Execute `npm run build` and tests to ensure clean compilation and zero linting/build errors.
