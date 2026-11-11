import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { NavbarComponent } from './navbar.component';
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

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getUserEmail: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      getUserEmail: vi.fn().mockReturnValue('')
    };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { NAV: { LOGIN: 'Log In' } });
    translate.use('en');

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should render translated Log In button instead of AUTH.LOGIN_BUTTON when visitor is unauthenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(false);
    fixture.detectChanges();

    const loginLink = fixture.nativeElement.querySelector('a[href="/login"]');
    expect(loginLink).toBeTruthy();
    expect(loginLink.textContent.trim()).toBe('Log In');
    expect(fixture.nativeElement.textContent).not.toContain('AUTH.LOGIN_BUTTON');
  });

  it('should render user initial avatar and hide Log In link when authenticated', () => {
    mockAuthService.isAuthenticated.mockReturnValue(true);
    mockAuthService.getUserEmail.mockReturnValue('maria@example.com');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeNull();
    expect(component.userInitial).toBe('M');
    expect(fixture.nativeElement.textContent).toContain('M');
  });
});

