import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { ShellComponent } from './shell.component';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotService } from '../../core/services/chatbot.service';

const localStore: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string): string | null => localStore[key] ?? null,
  setItem: (key: string, value: string): void => { localStore[key] = value; },
  removeItem: (key: string): void => { delete localStore[key]; },
  clear: (): void => { Object.keys(localStore).forEach(key => delete localStore[key]); },
  get length(): number { return Object.keys(localStore).length; },
  key: (index: number): string | null => Object.keys(localStore)[index] ?? null,
};
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;
  let mockAuthService: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getUserRole: ReturnType<typeof vi.fn>;
    isAdmin: ReturnType<typeof vi.fn>;
    getUserEmail: ReturnType<typeof vi.fn>;
    token: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(async () => {
    const tokenSignal = signal<string | null>('valid_jwt_token');
    mockAuthService = {
      token: tokenSignal,
      isAuthenticated: vi.fn().mockImplementation(() => !!tokenSignal()),
      getUserRole: vi.fn().mockReturnValue('REGISTERED_USER'),
      isAdmin: vi.fn().mockReturnValue(false),
      getUserEmail: vi.fn().mockReturnValue('test@example.com')
    };

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        ChatbotService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the shell component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle mobile sidebar state', () => {
    expect(component.mobileSidebarOpen()).toBe(false);
    component.toggleSidebar();
    expect(component.mobileSidebarOpen()).toBe(true);
    component.closeSidebar();
    expect(component.mobileSidebarOpen()).toBe(false);
  });

  it('should render chatbot widget when user is authenticated', () => {
    const widget = fixture.nativeElement.querySelector('app-chatbot-widget');
    expect(widget).toBeTruthy();
  });

  it('should not render chatbot widget when user is not authenticated', () => {
    mockAuthService.token.set(null);
    fixture.detectChanges();

    const widget = fixture.nativeElement.querySelector('app-chatbot-widget');
    expect(widget).toBeNull();
  });
});
