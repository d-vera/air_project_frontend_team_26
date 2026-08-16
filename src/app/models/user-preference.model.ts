export type LanguagePreference = 'ES' | 'EN';
export type ThemePreference = 'DARK' | 'LIGHT' | 'SYSTEM';

export interface UserPreference {
  id: number;
  language: LanguagePreference;
  theme: ThemePreference;
  active: boolean;
}

export interface UpdatePreferencePayload {
  language?: LanguagePreference;
  theme?: ThemePreference;
  active?: boolean;
}
