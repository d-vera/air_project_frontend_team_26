import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { UserPreferenceService } from './user-preference.service';
import { ThemeService } from './theme.service';
import { LanguageService } from './language.service';
import { UserPreference } from '../../models/user-preference.model';

// Mock localStorage for the Node.js test environment
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => store[key] ?? null,
  setItem: (key: string, value: string): void => { store[key] = value; },
  removeItem: (key: string): void => { delete store[key]; },
  clear: (): void => { Object.keys(store).forEach(key => delete store[key]); },
  get length(): number { return Object.keys(store).length; },
  key: (index: number): string | null => Object.keys(store)[index] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;
  let mockThemeService: { setThemeMode: ReturnType<typeof vi.fn> };
  let mockLanguageService: { setLanguage: ReturnType<typeof vi.fn> };
  let mockPreferenceService: {
    getPreferences: ReturnType<typeof vi.fn>;
    updatePreferences: ReturnType<typeof vi.fn>;
  };

  /** Default stub so getPreferences() returns a valid Observable. */
  const defaultPrefs: UserPreference = { id: 1, language: 'ES', theme: 'LIGHT' };

  beforeEach(() => {
    mockLocalStorage.clear();

    mockThemeService = { setThemeMode: vi.fn() };
    mockLanguageService = { setLanguage: vi.fn() };
    mockPreferenceService = {
      getPreferences: vi.fn().mockReturnValue(of(defaultPrefs)),
      updatePreferences: vi.fn().mockReturnValue(of(defaultPrefs)),
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ThemeService, useValue: mockThemeService },
        { provide: LanguageService, useValue: mockLanguageService },
        { provide: UserPreferenceService, useValue: mockPreferenceService },
      ],
    });

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    mockLocalStorage.clear();
  });

  function createService(): AuthService {
    return TestBed.inject(AuthService);
  }

  describe('initialization', () => {
    it('should create with null signals when no stored data', () => {
      service = createService();

      expect(service.token()).toBeNull();
      expect(service.email()).toBeNull();
      expect(service.role()).toBeNull();
      expect(service.isAuthenticated()).toBe(false);
    });

    it('should restore token from localStorage on creation', () => {
      mockLocalStorage.setItem('auth_token', 'stored-token');

      service = createService();

      expect(service.token()).toBe('stored-token');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('should restore email and role from localStorage on creation', () => {
      mockLocalStorage.setItem('auth_token', 'stored-token');
      mockLocalStorage.setItem('user_email', 'user@test.com');
      mockLocalStorage.setItem('user_role', 'ADMIN');

      service = createService();

      expect(service.email()).toBe('user@test.com');
      expect(service.role()).toBe('ADMIN');
    });

    it('should call loadUserPreferences when a token is present', () => {
      mockLocalStorage.setItem('auth_token', 'stored-token');

      service = createService();

      expect(mockPreferenceService.getPreferences).toHaveBeenCalled();
    });

    it('should NOT call loadUserPreferences when not authenticated', () => {
      service = createService();

      expect(mockPreferenceService.getPreferences).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should store auth data on successful login', () => {
      service = createService();

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();

      const req = httpTesting.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email: 'test@test.com', password: 'pass' });

      req.flush({
        token: 'new-token',
        tokenType: 'Bearer',
        email: 'test@test.com',
        role: 'REGISTERED_USER',
      });

      expect(service.token()).toBe('new-token');
      expect(service.email()).toBe('test@test.com');
      expect(service.role()).toBe('REGISTERED_USER');
      expect(mockLocalStorage.getItem('auth_token')).toBe('new-token');
    });

    it('should call loadUserPreferences after successful login', () => {
      service = createService();
      mockPreferenceService.getPreferences.mockClear();

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();

      const req = httpTesting.expectOne('/api/auth/login');
      req.flush({
        token: 'new-token',
        tokenType: 'Bearer',
        email: 'test@test.com',
        role: 'REGISTERED_USER',
      });

      expect(mockPreferenceService.getPreferences).toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('should store auth data on successful registration with token', () => {
      service = createService();

      service.register({
        email: 'new@test.com',
        password: 'pass',
        firstName: 'John',
        lastName: 'Doe',
      }).subscribe();

      const req = httpTesting.expectOne('/api/auth/register');
      expect(req.request.method).toBe('POST');

      req.flush({
        token: 'reg-token',
        tokenType: 'Bearer',
        email: 'new@test.com',
        role: 'REGISTERED_USER',
      });

      expect(service.token()).toBe('reg-token');
      expect(service.email()).toBe('new@test.com');
      expect(mockLocalStorage.getItem('auth_token')).toBe('reg-token');
    });

    it('should safely succeed without storing token if backend does not return token', () => {
      service = createService();

      let result: any;
      service.register({
        email: 'notoken@test.com',
        password: 'pass',
        firstName: 'John',
        lastName: 'Doe',
      }).subscribe(res => result = res);

      const req = httpTesting.expectOne('/api/auth/register');
      req.flush({ message: 'User created' });

      expect(service.token()).toBeNull();
      expect(result.message).toBe('User created');
    });

    it('should treat 2xx status errors (e.g. text/plain body) as success', () => {
      service = createService();

      let result: any;
      service.register({
        email: 'created@test.com',
        password: 'pass',
        firstName: 'John',
        lastName: 'Doe',
      }).subscribe(res => result = res);

      const req = httpTesting.expectOne('/api/auth/register');
      req.flush('User registered successfully', { status: 201, statusText: 'Created' });

      expect(result).toBeDefined();
      expect(result.email).toBe('created@test.com');
    });
  });

  describe('logout', () => {
    it('should clear auth data on successful logout', () => {
      mockLocalStorage.setItem('auth_token', 'existing-token');
      mockLocalStorage.setItem('user_email', 'user@test.com');
      mockLocalStorage.setItem('user_role', 'ADMIN');
      service = createService();

      service.logout().subscribe();

      const req = httpTesting.expectOne('/api/auth/logout');
      req.flush({});

      expect(service.token()).toBeNull();
      expect(service.email()).toBeNull();
      expect(service.role()).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    it('should clear auth data even when logout request fails', () => {
      mockLocalStorage.setItem('auth_token', 'existing-token');
      service = createService();

      service.logout().subscribe({ error: () => { /* expected */ } });

      const req = httpTesting.expectOne('/api/auth/logout');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(service.token()).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('clearAuthData', () => {
    it('should remove all auth keys from localStorage and reset signals', () => {
      mockLocalStorage.setItem('auth_token', 'token');
      mockLocalStorage.setItem('user_email', 'email');
      mockLocalStorage.setItem('user_role', 'ADMIN');
      service = createService();

      service.clearAuthData();

      expect(service.token()).toBeNull();
      expect(service.email()).toBeNull();
      expect(service.role()).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
      expect(mockLocalStorage.getItem('user_email')).toBeNull();
      expect(mockLocalStorage.getItem('user_role')).toBeNull();
    });
  });

  describe('role helpers', () => {
    it('isAdmin should return true for ADMIN role', () => {
      mockLocalStorage.setItem('auth_token', 'token');
      mockLocalStorage.setItem('user_role', 'ADMIN');
      service = createService();

      expect(service.isAdmin()).toBe(true);
      expect(service.getUserRole()).toBe('ADMIN');
    });

    it('isAdmin should return false for REGISTERED_USER role', () => {
      mockLocalStorage.setItem('auth_token', 'token');
      mockLocalStorage.setItem('user_role', 'REGISTERED_USER');
      service = createService();

      expect(service.isAdmin()).toBe(false);
    });

    it('getUserEmail should return the stored email', () => {
      mockLocalStorage.setItem('auth_token', 'token');
      mockLocalStorage.setItem('user_email', 'admin@test.com');
      service = createService();

      expect(service.getUserEmail()).toBe('admin@test.com');
    });
  });

  describe('loadUserPreferences', () => {
    it('should clear auth data when preferences request returns 401', () => {
      mockPreferenceService.getPreferences.mockReturnValue(
        throwError(() => ({ status: 401 }))
      );

      mockLocalStorage.setItem('auth_token', 'stale-token');
      service = createService();

      // Constructor triggers loadUserPreferences -> gets 401 -> clears auth data
      expect(service.token()).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    it('should clear auth data when preferences request returns 403', () => {
      mockPreferenceService.getPreferences.mockReturnValue(
        throwError(() => ({ status: 403 }))
      );

      mockLocalStorage.setItem('auth_token', 'stale-token');
      service = createService();

      expect(service.token()).toBeNull();
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    it('should NOT clear auth data on other errors (e.g. 500)', () => {
      mockPreferenceService.getPreferences.mockReturnValue(
        throwError(() => ({ status: 500 }))
      );

      mockLocalStorage.setItem('auth_token', 'valid-token');
      service = createService();

      // Token should still be there
      expect(service.token()).toBe('valid-token');
      expect(mockLocalStorage.getItem('auth_token')).toBe('valid-token');
    });

    it('should apply theme and language from loaded preferences', () => {
      const prefs: UserPreference = { id: 1, language: 'EN', theme: 'DARK' };
      mockPreferenceService.getPreferences.mockReturnValue(of(prefs));

      mockLocalStorage.setItem('auth_token', 'valid-token');
      service = createService();

      expect(mockThemeService.setThemeMode).toHaveBeenCalledWith('DARK', false);
      expect(mockLanguageService.setLanguage).toHaveBeenCalledWith('EN', false);
    });

    it('should not apply theme when preference has no theme', () => {
      const prefs = { id: 1, language: 'ES', theme: undefined } as unknown as UserPreference;
      mockPreferenceService.getPreferences.mockReturnValue(of(prefs));

      mockLocalStorage.setItem('auth_token', 'valid-token');
      service = createService();

      expect(mockThemeService.setThemeMode).not.toHaveBeenCalled();
    });

    it('should not apply language when preference has no language', () => {
      const prefs = { id: 1, language: undefined, theme: 'LIGHT' } as unknown as UserPreference;
      mockPreferenceService.getPreferences.mockReturnValue(of(prefs));

      mockLocalStorage.setItem('auth_token', 'valid-token');
      service = createService();

      expect(mockLanguageService.setLanguage).not.toHaveBeenCalled();
    });
  });
});
