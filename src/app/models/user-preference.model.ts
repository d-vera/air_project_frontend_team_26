export type Language = 'ES' | 'EN';
export type Theme = 'DARK' | 'LIGHT' | 'SYSTEM';

// Compatibility aliases
export type LanguagePreference = Language;
export type ThemePreference = Theme;

export interface PreferenceResponse {
  id: number;
  language: Language;
  theme: Theme;
}

export interface UpdatePreferenceRequest {
  language?: Language;
  theme?: Theme;
}

// Compatibility aliases
export type UserPreference = PreferenceResponse;
export type UpdatePreferencePayload = UpdatePreferenceRequest;
