import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

const localStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => localStore[key] ?? null,
  setItem: (key: string, value: string): void => { localStore[key] = value; },
  removeItem: (key: string): void => { delete localStore[key]; },
  clear: (): void => { Object.keys(localStore).forEach(key => delete localStore[key]); },
  get length(): number { return Object.keys(localStore).length; },
  key: (index: number): string | null => Object.keys(localStore)[index] ?? null
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: {
    login: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn().mockReturnValue(of({ token: 'jwt-token' }))
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('es', {
      AUTH: {
        CONTINUE_AS_VISITOR: 'Continuar como visitante',
        INVALID_CREDENTIALS: 'Correo o contraseña incorrectos'
      }
    });
    translate.use('es');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render a Continue as Visitor link navigating to /dashboard', () => {
    const visitorLink = fixture.nativeElement.querySelector('a[href="/dashboard"]');
    expect(visitorLink).toBeTruthy();
    expect(visitorLink.textContent.trim()).toBe('Continuar como visitante');
  });

  it('should navigate to /dashboard on successful login', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.email = 'user@example.com';
    component.password = 'password123';
    component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'password123'
    });
    expect(navSpy).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should display invalid credentials error key when login returns 401', () => {
    mockAuthService.login.mockReturnValueOnce(throwError(() => ({ status: 401 })));

    component.email = 'user@example.com';
    component.password = 'wrong';
    component.onSubmit();

    expect(component.errorMessage()).toBe('AUTH.INVALID_CREDENTIALS');
  });
});

