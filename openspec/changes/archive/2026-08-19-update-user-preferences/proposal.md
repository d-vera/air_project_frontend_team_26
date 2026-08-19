## Why

The backend API for managing user UI preferences (`GET /api/preferences/me` and `PATCH /api/preferences/me`) has been updated to remove the redundant `active` field. The preference entity is strictly focused on UI personalization—namely Theme (`DARK` | `LIGHT` | `SYSTEM`) and Language (`ES` | `EN`). The frontend data models, preference service, UI component, and i18n localization resources need to be updated to align with the backend contract.

## What Changes

- **Models**: Update `UserPreference` / `PreferenceResponse` and `UpdatePreferencePayload` / `UpdatePreferenceRequest` types to eliminate the `active` property. Standardize types with aliases (`Language`, `Theme`, `PreferenceResponse`, `UpdatePreferenceRequest`).
- **Preferences Component**: Remove the active status toggle card, state signals (`activeStatus`), and toggle handler (`onToggleActive`) from `PreferencesComponent` (`preferences.component.ts` & `preferences.component.html`).
- **Localization**: Clean up unused translation keys related to `ACTIVE_SETTING`, `ACTIVE_LABEL`, `ACTIVE_DESC` in `assets/i18n/en.json` and `assets/i18n/es.json`.
- **Specs**: Introduce a dedicated `user-preferences` capability specification representing the updated contract and UI behavior.

## Capabilities

### New Capabilities
- `user-preferences`: User interface preferences management covering Theme (`DARK`, `LIGHT`, `SYSTEM`) and Language (`ES`, `EN`) synchronization with backend `GET /api/preferences/me` and `PATCH /api/preferences/me`.

### Modified Capabilities

## Impact

- `src/app/models/user-preference.model.ts`: Interface cleanup removing `active` and aligning with API contract specification.
- `src/app/core/services/user-preference.service.ts`: Updated typing references.
- `src/app/features/preferences/preferences.component.ts`: Removal of `activeStatus` signal and `onToggleActive` method.
- `src/app/features/preferences/preferences.component.html`: Removal of active toggle UI card.
- `src/assets/i18n/en.json` & `src/assets/i18n/es.json`: Removal of unused active toggle translation keys.
