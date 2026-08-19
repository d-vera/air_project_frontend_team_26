## 1. Models & Services Update

- [x] 1.1 Update `src/app/models/user-preference.model.ts` to export `Language`, `Theme`, `PreferenceResponse`, and `UpdatePreferenceRequest` without `active` field, along with compatibility aliases.
- [x] 1.2 Verify and adjust `UserPreferenceService` methods (`getPreferences`, `updatePreferences`) and dependent services (`LanguageService`, `ThemeService`, `AuthService`).

## 2. Component & UI Update

- [x] 2.1 Remove `activeStatus` signal and `onToggleActive` method from `PreferencesComponent` (`src/app/features/preferences/preferences.component.ts`).
- [x] 2.2 Remove the preference active toggle card markup from `src/app/features/preferences/preferences.component.html`.
- [x] 2.3 Clean up obsolete translation keys (`ACTIVE_SETTING`, `ACTIVE_LABEL`, `ACTIVE_DESC`) in `src/assets/i18n/en.json` and `src/assets/i18n/es.json`.

## 3. Verification & Testing

- [x] 3.1 Run type-checking / build (`npm run build` or `ng build`) to ensure no broken references.
- [x] 3.2 Run test suite (`npm test`) to ensure all tests pass.
