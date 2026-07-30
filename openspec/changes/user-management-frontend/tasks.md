## 1. Project Scaffolding & Configuration

- [ ] 1.1 Scaffold Angular 19 application with standalone components using `npx @angular/cli@latest new` in the workspace root
- [ ] 1.2 Install and configure TailwindCSS v4 (`@tailwindcss/postcss`)
- [ ] 1.3 Install `@ngx-translate/core` and `@ngx-translate/http-loader` dependencies
- [ ] 1.4 Configure Angular proxy (`proxy.conf.json`) to forward `/api/*` to `http://localhost:8080`
- [ ] 1.5 Set up global styles in `styles.css` with TailwindCSS imports, custom theme tokens (sky/cyan/violet palette), and dark mode base styles

## 2. Core Models & Services

- [ ] 2.1 Create TypeScript interfaces: `User`, `LoginRequest`, `RegisterRequest`, `UpdateUserRequest`, `AssignRoleRequest`, `AuthResponse`, `UserResponse`
- [ ] 2.2 Create `AuthService` — login, register, logout, token storage (localStorage), `isAuthenticated()`, `getCurrentUser()`, `getUserRole()`
- [ ] 2.3 Create `UserService` — `getMe()`, `updateMe()`, `getAllUsers()`, `getUserById()`, `updateUser()`, `deleteUser()`, `assignRole()`
- [ ] 2.4 Create `ThemeService` — toggle dark/light, persist to localStorage, read OS preference on first load
- [ ] 2.5 Create functional HTTP interceptor (`authInterceptor`) — attach Bearer token, handle 401 responses (clear token + redirect to login)

## 3. Guards & Routing

- [ ] 3.1 Create `authGuard` — redirect unauthenticated users to `/login`
- [ ] 3.2 Create `adminGuard` — redirect non-admin users to `/dashboard`
- [ ] 3.3 Configure application routes: `/login`, `/register` (public); `/dashboard`, `/dashboard/profile` (auth); `/admin/users`, `/admin/users/:id` (admin)
- [ ] 3.4 Register interceptor and guards in `app.config.ts` with `provideHttpClient(withInterceptors([...]))` and `provideRouter(routes)`

## 4. i18n Setup

- [ ] 4.1 Create translation files `assets/i18n/en.json` and `assets/i18n/es.json` with all UI text keys (auth, profile, admin, navigation, errors, common)
- [ ] 4.2 Configure `TranslateModule` with `HttpLoaderFactory` in `app.config.ts`
- [ ] 4.3 Create `LanguageService` — toggle language, persist to localStorage, detect browser default language

## 5. Shared Components & Layout

- [ ] 5.1 Create `ShellComponent` (layout) — sidebar + top navbar + `<router-outlet>` for content area
- [ ] 5.2 Create `SidebarComponent` — navigation links (role-aware), theme toggle, language toggle, logout button, collapsible on mobile/tablet
- [ ] 5.3 Create `NavbarComponent` — hamburger menu button (mobile/tablet), page title, user info
- [ ] 5.4 Create `ThemeToggleComponent` — dark/light switch button with icon
- [ ] 5.5 Create `LanguageToggleComponent` — ES/EN selector dropdown or toggle

## 6. Authentication Pages (Public)

- [ ] 6.1 Create `LoginComponent` — centered card layout, email/password form, validation, error messages, link to register page
- [ ] 6.2 Create `RegisterComponent` — centered card layout, email/password/firstName/lastName form, validation (password ≥8 chars), error messages (409 conflict), link to login page
- [ ] 6.3 Style login and register pages with full-page centered layout (no sidebar), responsive on mobile

## 7. Dashboard & Profile Pages (Authenticated)

- [ ] 7.1 Create `DashboardComponent` — welcome page showing user name and role, quick links
- [ ] 7.2 Create `ProfileComponent` — view mode showing user details (email, name, role, created date), edit mode with form for firstName, lastName, optional password

## 8. Admin User Management (Admin Only)

- [ ] 8.1 Create `UserListComponent` — card-based grid of all active users, each card showing name, email, role, status with action buttons (view, edit role, deactivate)
- [ ] 8.2 Create `UserDetailComponent` — full user profile view with edit form (firstName, lastName, password), role assignment dropdown, activate/deactivate toggle with confirmation dialog
- [ ] 8.3 Create confirmation dialog for user deactivation (reusable modal component)
- [ ] 8.4 Implement role assignment UI — dropdown with `REGISTERED_USER` and `ADMIN` options, confirmation before changing

## 9. Responsive Polish & Final Integration

- [ ] 9.1 Verify all pages render correctly on mobile (320px+), tablet (768px+), and desktop (1024px+)
- [ ] 9.2 Verify dark/light mode applies consistently across all components
- [ ] 9.3 Verify all user-facing text uses translation keys (no hardcoded strings)
- [ ] 9.4 Verify route guards work correctly (unauthenticated → login, non-admin → dashboard)
- [ ] 9.5 Test full auth flow: register → login → view profile → update profile → logout
- [ ] 9.6 Test full admin flow: list users → view user → edit user → assign role → deactivate user
