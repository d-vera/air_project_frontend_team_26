import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { SidebarComponent } from './sidebar.component';
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

describe('SidebarComponent', () => {
  let component: SidebarComponent;
  let fixture: ComponentFixture<SidebarComponent>;
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    isAdmin: ReturnType<typeof vi.fn>;
    getUserEmail: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      isAdmin: vi.fn().mockReturnValue(false),
      getUserEmail: vi.fn().mockReturnValue(''),
      logout: vi.fn().mockReturnValue(of(void 0))
    };

    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SidebarComponent);
    component = fixture.componentInstance;
  });

  describe('Visitor (unauthenticated) state', () => {
    beforeEach(() => {
      mockAuthService.isAuthenticated.mockReturnValue(false);
      mockAuthService.isAdmin.mockReturnValue(false);
      mockAuthService.getUserEmail.mockReturnValue('');
      fixture.detectChanges();
    });

    it('should display Visitor badge with V initial instead of Registered User and hide User Management subtitle', () => {
      const text = fixture.nativeElement.textContent;
      expect(component.userInitial).toBe('V');
      expect(text).toContain('NAV.VISITOR');
      expect(text).toContain('NAV.VISITOR_ACCESS');
      expect(text).not.toContain('APP.USER_MANAGEMENT');
      expect(text).not.toContain('ADMIN.ROLE_REGISTERED_USER');
      expect(text).not.toContain('ADMIN.ROLE_ADMIN');
    });

    it('should show only Dashboard link and hide Profile, Preferences, Reports, and Admin links', () => {
      const links = Array.from(
        fixture.nativeElement.querySelectorAll('nav a')
      ) as HTMLAnchorElement[];
      const hrefs = links.map(a => a.getAttribute('href') || a.getAttribute('ng-reflect-router-link'));

      expect(links.length).toBe(1);
      expect(hrefs[0]).toContain('/dashboard');
      expect(fixture.nativeElement.textContent).toContain('NAV.DASHBOARD');
      expect(fixture.nativeElement.textContent).not.toContain('NAV.PROFILE');
      expect(fixture.nativeElement.textContent).not.toContain('NAV.PREFERENCES');
      expect(fixture.nativeElement.textContent).not.toContain('NAV.REPORTS');
      expect(fixture.nativeElement.textContent).not.toContain('NAV.ADMIN_USERS');
      expect(fixture.nativeElement.textContent).not.toContain('NAV.ADMIN_SENSORS');
    });

    it('should hide Log Out button and show Log In link pointing to /login', () => {
      const text = fixture.nativeElement.textContent;
      expect(text).not.toContain('NAV.LOGOUT');
      expect(text).toContain('NAV.LOGIN');

      const loginLink = fixture.nativeElement.querySelector('a[href="/login"]');
      expect(loginLink).toBeTruthy();

      const closeSpy = vi.spyOn(component.closeSidebar, 'emit');
      loginLink.click();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe('Authenticated user states', () => {
    it('should show user email, Registered User badge, protected links, and Log Out for registered users', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isAdmin.mockReturnValue(false);
      mockAuthService.getUserEmail.mockReturnValue('citizen@example.com');
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(component.userInitial).toBe('C');
      expect(text).toContain('APP.USER_MANAGEMENT');
      expect(text).toContain('citizen@example.com');
      expect(text).toContain('ADMIN.ROLE_REGISTERED_USER');
      expect(text).toContain('NAV.DASHBOARD');
      expect(text).toContain('NAV.PROFILE');
      expect(text).toContain('NAV.PREFERENCES');
      expect(text).toContain('NAV.REPORTS');
      expect(text).toContain('NAV.LOGOUT');
      expect(text).not.toContain('NAV.ADMIN_USERS');
      expect(fixture.nativeElement.querySelector('a[href="/login"]')).toBeNull();
    });

    it('should show Admin role badge and administration links for admin users', () => {
      mockAuthService.isAuthenticated.mockReturnValue(true);
      mockAuthService.isAdmin.mockReturnValue(true);
      mockAuthService.getUserEmail.mockReturnValue('admin@example.com');
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(component.userInitial).toBe('A');
      expect(text).toContain('ADMIN.ROLE_ADMIN');
      expect(text).toContain('NAV.ADMIN_USERS');
      expect(text).toContain('NAV.ADMIN_SENSORS');
    });

    it('should navigate to /login on logout', () => {
      const router = TestBed.inject(Router);
      const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

      mockAuthService.isAuthenticated.mockReturnValue(true);
      fixture.detectChanges();

      component.onLogout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(navSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});
