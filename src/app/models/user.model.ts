export type UserRole = 'REGISTERED_USER' | 'ADMIN';
export type PreferredTheme = 'DARK' | 'LIGHT';
export type PreferredLanguage = 'es' | 'en';

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  preferredTheme?: PreferredTheme;
  preferredLanguage?: PreferredLanguage;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  active: boolean;
  preferredTheme?: PreferredTheme;
  preferredLanguage?: PreferredLanguage;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  password?: string;
  active?: boolean;
}

export interface UpdatePreferencesRequest {
  preferredTheme?: PreferredTheme;
  preferredLanguage?: PreferredLanguage;
}

export interface AssignRoleRequest {
  role: UserRole;
}


