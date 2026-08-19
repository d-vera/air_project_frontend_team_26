## Context

The backend API endpoints for user interface preferences (`GET /api/preferences/me` and `PATCH /api/preferences/me`) have been streamlined to manage solely UI personalization (Theme: `DARK`, `LIGHT`, `SYSTEM` and Language: `ES`, `EN`). The obsolete `active` property has been removed from the backend database schema and API DTOs.

The Angular frontend needs to update its TypeScript models, service signatures, preferences view template, and localization files accordingly.

## Goals / Non-Goals

**Goals:**
- Update `src/app/models/user-preference.model.ts` to reflect the clean API contract (`Language`, `Theme`, `PreferenceResponse`, `UpdatePreferenceRequest`), with backwards-compatible aliases if necessary.
- Update `UserPreferenceService` to match the exact request/response signatures.
- Clean up `PreferencesComponent` component logic and HTML template to eliminate references to `active` / `onToggleActive`.
- Clean up unused translation keys in `en.json` and `es.json`.
- Ensure tests and application build pass cleanly.

**Non-Goals:**
- Changing authentication token handling (the existing HTTP interceptor automatically appends the Bearer token).
- Modifying backend endpoints or database schemas.

## Decisions

- **Decision 1: Export canonical API types while retaining backward-compatible aliases**
  - Define `Language = 'ES' | 'EN'` and `Theme = 'DARK' | 'LIGHT' | 'SYSTEM'`.
  - Export `PreferenceResponse` and `UpdatePreferenceRequest` as defined in the contract, and export type aliases `UserPreference = PreferenceResponse` and `UpdatePreferencePayload = UpdatePreferenceRequest` to ensure non-breaking changes across existing services (`LanguageService`, `ThemeService`, `AuthService`).
- **Decision 2: Remove redundant toggle card in `PreferencesComponent`**
  - Remove the toggle card UI section and corresponding component signals (`activeStatus`) and event handlers (`onToggleActive`). Keep the two main feature cards: Theme Selection (SYSTEM, DARK, LIGHT) and Language Selection (ES, EN).

## Risks / Trade-offs

- [Risk] Unintended breakages in other services referencing `UserPreference` → Mitigation: Maintain type alias compatibility in `user-preference.model.ts` and verify build with `ng build`.
