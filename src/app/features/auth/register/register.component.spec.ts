import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/services/auth.service';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import enTranslations from '../../../../assets/i18n/en.json';
import esTranslations from '../../../../assets/i18n/es.json';

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

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let mockAuthService: {
    register: ReturnType<typeof vi.fn>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    mockAuthService = {
      register: vi.fn(),
      isAuthenticated: vi.fn().mockReturnValue(false)
    };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockImplementation(() => Promise.resolve(true));

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', enTranslations);
    translate.setTranslation('es', esTranslations);
    translate.use('es');

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create the register component', () => {
    expect(component).toBeTruthy();
    expect(component.errorMessage()).toBeNull();
    expect(component.successMessage()).toBeNull();
    expect(component.loading()).toBe(false);
  });

  it('should display "Nombre(s)" and "Apellido(s)" labels and placeholders in Spanish', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('es');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const firstNameLabel = compiled.querySelector('label[for="firstName"]');
    const lastNameLabel = compiled.querySelector('label[for="lastName"]');
    const firstNameInput = compiled.querySelector('#firstName') as HTMLInputElement;
    const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;

    expect(firstNameLabel?.textContent?.trim()).toBe('Nombre(s)');
    expect(lastNameLabel?.textContent?.trim()).toBe('Apellido(s)');
    expect(firstNameInput.getAttribute('placeholder')).toBe('Nombre(s)');
    expect(lastNameInput.getAttribute('placeholder')).toBe('Apellido(s)');
  });

  it('should display "First Name(s)" and "Last Name(s)" labels and placeholders in English', () => {
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const firstNameLabel = compiled.querySelector('label[for="firstName"]');
    const lastNameLabel = compiled.querySelector('label[for="lastName"]');
    const firstNameInput = compiled.querySelector('#firstName') as HTMLInputElement;
    const lastNameInput = compiled.querySelector('#lastName') as HTMLInputElement;

    expect(firstNameLabel?.textContent?.trim()).toBe('First Name(s)');
    expect(lastNameLabel?.textContent?.trim()).toBe('Last Name(s)');
    expect(firstNameInput.getAttribute('placeholder')).toBe('First Name(s)');
    expect(lastNameInput.getAttribute('placeholder')).toBe('Last Name(s)');
  });

  it('should toggle password visibility signal', () => {
    expect(component.showPassword()).toBe(false);
    component.showPassword.set(true);
    expect(component.showPassword()).toBe(true);
    component.showPassword.set(false);
    expect(component.showPassword()).toBe(false);
  });

  it('should not submit if required fields are missing', () => {
    component.email = '';
    component.password = '';
    component.firstName = '';
    component.lastName = '';

    component.onSubmit();
    expect(mockAuthService.register).not.toHaveBeenCalled();
  });

  it('should show green success message on successful registration and redirect to login if not authenticated', () => {
    vi.useFakeTimers();

    mockAuthService.register.mockReturnValue(of({
      token: '',
      tokenType: '',
      email: 'john@example.com',
      role: 'REGISTERED_USER' as any
    }));
    mockAuthService.isAuthenticated.mockReturnValue(false);

    component.email = '  john@example.com  ';
    component.password = 'password123';
    component.firstName = '  John  ';
    component.lastName = '  Doe  ';

    component.onSubmit();

    expect(mockAuthService.register).toHaveBeenCalledWith({
      email: 'john@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    });
    expect(component.loading()).toBe(false);
    expect(component.successMessage()).toBe('AUTH.REGISTER_SUCCESS');
    expect(component.errorMessage()).toBeNull();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-emerald-700, .dark\\:text-emerald-300, .bg-emerald-50')).toBeTruthy();

    vi.advanceTimersByTime(1500);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should redirect to dashboard on successful registration if token was returned and authenticated', () => {
    vi.useFakeTimers();

    mockAuthService.register.mockReturnValue(of({
      token: 'jwt-token-123',
      tokenType: 'Bearer',
      email: 'jane@example.com',
      role: 'REGISTERED_USER' as any
    }));
    mockAuthService.isAuthenticated.mockReturnValue(true);

    component.email = 'jane@example.com';
    component.password = 'password123';
    component.firstName = 'Jane';
    component.lastName = 'Doe';

    component.onSubmit();

    expect(component.successMessage()).toBe('AUTH.REGISTER_SUCCESS');
    vi.advanceTimersByTime(1500);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should show red error message with AUTH.EMAIL_EXISTS on 409 conflict', () => {
    const errorResponse = new HttpErrorResponse({ status: 409 });
    mockAuthService.register.mockReturnValue(throwError(() => errorResponse));

    component.email = 'existing@example.com';
    component.password = 'password123';
    component.firstName = 'Jane';
    component.lastName = 'Doe';

    component.onSubmit();

    expect(component.loading()).toBe(false);
    expect(component.errorMessage()).toBe('AUTH.EMAIL_EXISTS');
    expect(component.successMessage()).toBeNull();

    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.text-red-700, .dark\\:text-red-300, .bg-red-50')).toBeTruthy();
  });

  it('should show specific backend error message when backend returns an error message', () => {
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: { message: 'Password must contain at least one special character' }
    });
    mockAuthService.register.mockReturnValue(throwError(() => errorResponse));

    component.email = 'test@example.com';
    component.password = 'weak';
    component.firstName = 'Test';
    component.lastName = 'User';

    component.onSubmit();

    expect(component.errorMessage()).toBe('Password must contain at least one special character');
    expect(component.successMessage()).toBeNull();
  });

  it('should show backend string error when error is plain text', () => {
    const errorResponse = new HttpErrorResponse({
      status: 400,
      error: 'Invalid input data'
    });
    mockAuthService.register.mockReturnValue(throwError(() => errorResponse));

    component.email = 'test@example.com';
    component.password = 'secret123';
    component.firstName = 'Test';
    component.lastName = 'User';

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid input data');
  });

  it('should treat 2xx status error (e.g. non-JSON 200/201 response) as success', () => {
    vi.useFakeTimers();

    const errorResponse = new HttpErrorResponse({
      status: 201,
      statusText: 'Created',
      error: new SyntaxError('Unexpected token in JSON')
    });
    mockAuthService.register.mockReturnValue(throwError(() => errorResponse));

    component.email = 'test@example.com';
    component.password = 'secret123';
    component.firstName = 'Test';
    component.lastName = 'User';

    component.onSubmit();

    expect(component.successMessage()).toBe('AUTH.REGISTER_SUCCESS');
    expect(component.errorMessage()).toBeNull();

    vi.advanceTimersByTime(1500);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
