## 1. Data Models & API Integration

- [x] 1.1 Update `User`, `UserResponse`, and add `UpdatePreferencesRequest` in `src/app/models/user.model.ts` to include `preferredTheme` and `preferredLanguage` properties.
- [x] 1.2 Update `UserService` in `src/app/core/services/user.service.ts` with `updatePreferences(data: UpdatePreferencesRequest)` targeting `PATCH /api/users/me/preferences`.

## 2. Theme & Language Services Backend Sync

- [x] 2.1 Enhance `ThemeService` in `src/app/core/services/theme.service.ts` to synchronize theme changes via `PATCH /api/users/me/preferences` for authenticated users.
- [x] 2.2 Enhance `LanguageService` in `src/app/core/services/language.service.ts` to synchronize language changes via `PATCH /api/users/me/preferences` for authenticated users.

## 3. Auth & Bootstrap Synchronization Flow

- [x] 3.1 Update `AuthService` or startup initialization logic to fetch user preferences from `/api/users/me` on login/app load and sync them to `ThemeService` and `LanguageService`.

## 4. Verification

- [x] 4.1 Run unit tests and build check (`npm run build` or `ng build`) to verify implementation correctness and type safety.
