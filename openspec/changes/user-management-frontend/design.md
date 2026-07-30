## Context

The Air Project backend is a Spring Boot application exposing a User Management REST API at `http://localhost:8080` with JWT-based authentication. The API is organized into two controller groups:

- **Authentication** (`/api/auth/*`): register, login, logout
- **User Management** (`/api/users/*`): self-service profile, admin CRUD, role assignment

The frontend workspace (`air_project_frontend_team_26`) is currently empty — this is a greenfield Angular SPA. Two roles exist: `REGISTERED_USER` and `ADMIN`. Users have a soft-delete flag (`active: boolean`).

## Goals / Non-Goals

**Goals:**
- Build a fully functional Angular 19 SPA consuming all backend user-management endpoints
- Implement JWT auth with automatic token attachment via HTTP interceptor
- Provide admin and self-service UX matching the use-case diagram
- Support dark/light theme toggling persisted to localStorage
- Support runtime Spanish/English language switching via `@ngx-translate/core`
- Fully responsive design: mobile-first with sidebar layout on desktop
- Card-based admin user management interface

**Non-Goals:**
- Backend modifications (no CORS, no new endpoints — assumes backend is already configured)
- Air quality data visualization (separate module, future work)
- User avatar/image upload
- Password reset / forgot password flow (not in current API)
- Role-based dashboard content (beyond access control)
- E2E or unit testing (will be a separate change)

## Decisions

### 1. Angular 19 with Standalone Components
**Decision**: Use Angular 19 with standalone components (no NgModules).
**Rationale**: Standalone components are the modern Angular pattern — simpler, tree-shakable, and the recommended approach since Angular 16+. Eliminates boilerplate NgModule declarations.
**Alternatives considered**: NgModule-based architecture — rejected as legacy pattern with more boilerplate.

### 2. TailwindCSS v4
**Decision**: Use TailwindCSS v4 for styling with CSS-first configuration.
**Rationale**: v4 uses a CSS-first approach (`@theme` in CSS) instead of `tailwind.config.js`, which simplifies theming. Dark mode via the `dark` variant class on `<html>`.
**Alternatives considered**: TailwindCSS v3 — rejected because user requested latest.

### 3. Theme Implementation
**Decision**: Toggle `dark` class on `<html>` element. Use TailwindCSS `dark:` variant for all theme-sensitive styles. Persist preference to `localStorage` under key `theme`. Default to system preference via `prefers-color-scheme`.
**Rationale**: TailwindCSS's built-in dark mode support is the simplest and most maintainable approach.
**Alternatives considered**: CSS custom properties without Tailwind — more work for same result.

### 4. i18n with @ngx-translate/core
**Decision**: Use `@ngx-translate/core` + `@ngx-translate/http-loader` for runtime language switching. Translation files at `assets/i18n/en.json` and `assets/i18n/es.json`. Persist language preference to `localStorage` under key `lang`. Default to browser language.
**Rationale**: User-requested. Supports runtime switching without rebuilding. Mature, well-maintained library.
**Alternatives considered**: Angular's built-in `@angular/localize` — requires separate builds per locale, no runtime switching.

### 5. JWT Token Management
**Decision**: Store JWT token in `localStorage`. Attach via functional HTTP interceptor (`httpInterceptorFn`). On 401 responses, clear token and redirect to login.
**Rationale**: Functional interceptors are the Angular 19 pattern. localStorage is simple and survives page refresh.
**Alternatives considered**: sessionStorage (lost on tab close), httpOnly cookies (requires backend changes).

### 6. Routing & Guards
**Decision**: Use Angular Router with functional route guards:
- `authGuard`: Redirects unauthenticated users to `/login`
- `adminGuard`: Redirects non-admin users to `/dashboard`

Route structure:
```
/login              → LoginComponent (public)
/register           → RegisterComponent (public)
/dashboard          → DashboardComponent (auth required)
/dashboard/profile  → ProfileComponent (auth required)
/admin/users        → UserListComponent (admin required)
/admin/users/:id    → UserDetailComponent (admin required)
```
**Rationale**: Clean URL structure matching the use-case roles. Functional guards are the modern Angular pattern.

### 7. Responsive Sidebar Layout
**Decision**: Shell component with collapsible sidebar. Desktop: permanent sidebar (250px). Tablet: overlay sidebar with backdrop. Mobile: hamburger menu triggering overlay sidebar. Breakpoints: mobile <768px, tablet 768-1024px, desktop >1024px.
**Rationale**: Sidebar layouts are standard for dashboard-style applications. Collapsible pattern maximizes content area on smaller screens.

### 8. Color Palette
**Decision**: Blues/teals atmosphere theme for air quality project:
- Primary: `#0ea5e9` (sky-500) — sky blue
- Secondary: `#06b6d4` (cyan-500) — cyan
- Accent: `#8b5cf6` (violet-500) — for actions/highlights
- Dark background: `#0f172a` (slate-900)
- Light background: `#f8fafc` (slate-50)
**Rationale**: Sky/atmosphere colors reinforce the "air quality" project identity while maintaining excellent contrast ratios.

### 9. Project Structure
**Decision**:
```
src/
├── app/
│   ├── core/                  # Singletons, interceptors, guards
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── services/
│   ├── features/              # Feature-based modules
│   │   ├── auth/              # Login, Register
│   │   ├── dashboard/         # Profile, Dashboard home
│   │   └── admin/             # User management (list, detail)
│   ├── shared/                # Reusable components, pipes
│   │   ├── components/        # Sidebar, navbar, theme toggle, lang toggle
│   │   └── pipes/
│   ├── layouts/               # Shell layout with sidebar
│   └── models/                # TypeScript interfaces
├── assets/
│   └── i18n/
│       ├── en.json
│       └── es.json
└── styles.css                 # TailwindCSS + global styles
```
**Rationale**: Feature-based organization scales well and keeps related components together.

## Risks / Trade-offs

- **CORS not configured on backend** → The Angular dev server (`ng serve`) will run on a different port (4200). If the backend doesn't have CORS configured for `localhost:4200`, API calls will fail. **Mitigation**: Use Angular's proxy configuration (`proxy.conf.json`) to forward `/api/*` requests to `localhost:8080`.
- **JWT in localStorage is XSS-vulnerable** → If XSS occurs, tokens can be stolen. **Mitigation**: Acceptable for this project scope; Angular's built-in XSS protection helps. Production hardening is a future concern.
- **@ngx-translate/core maintenance** → Library is community-maintained. **Mitigation**: Stable, widely used, and Angular 19 compatible. Can migrate to official i18n later if needed.
- **TailwindCSS v4 is relatively new** → Some ecosystem plugins may not support v4 yet. **Mitigation**: We only use core features (dark mode, responsive utilities, theme), no plugins needed.
