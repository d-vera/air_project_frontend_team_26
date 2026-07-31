## Why

The Air Project backend already exposes a complete User Management REST API (authentication, profile self-service, admin CRUD, and role assignment) but has no frontend to consume it. The team needs a production-quality Angular SPA that provides visitors, registered users, and administrators with the interfaces defined in the use-case diagram — registration, login/logout, profile management, user administration, and role assignment — with full i18n (Spanish/English), dark/light theming, and responsive design.

## What Changes

- **New Angular 19 application** scaffolded with standalone components in the `air_project_frontend_team_26` workspace.
- **Authentication flow**: Login and registration pages consuming `POST /api/auth/login`, `POST /api/auth/register`, and `POST /api/auth/logout`. JWT stored and attached via HTTP interceptor.
- **Profile self-service**: Authenticated users can view and update their own profile via `GET /api/users/me` and `PUT /api/users/me`.
- **Admin user management**: Admin-only pages to list all active users (`GET /api/users`), view/edit individual users (`GET/PUT /api/users/{id}`), soft-delete/activate users (`DELETE /api/users/{id}`), and assign roles (`PUT /api/users/{id}/role`). Card-based layout.
- **Dark/light theme**: Toggle with CSS variables and TailwindCSS v4, persisted to localStorage.
- **i18n (ES/EN)**: Runtime language switching via `@ngx-translate/core`, persisted to localStorage.
- **Responsive sidebar layout**: Collapsible sidebar navigation that adapts to mobile/tablet/desktop.
- **Route guards**: `AuthGuard` for authenticated routes, `RoleGuard` for admin-only routes.

## Capabilities

### New Capabilities
- `auth-flow`: User registration, login, logout with JWT token management and HTTP interceptor.
- `profile-management`: Authenticated user self-service for viewing and updating their own profile.
- `admin-user-management`: Admin panel for listing, viewing, editing, activating/deactivating users, and assigning roles. Card-based layout.
- `theming`: Dark/light mode toggle with TailwindCSS v4 and CSS custom properties, persisted to localStorage.
- `i18n`: Runtime Spanish/English language switching with `@ngx-translate/core`, persisted to localStorage.
- `responsive-layout`: Sidebar navigation layout with responsive breakpoints for mobile, tablet, and desktop.

### Modified Capabilities
<!-- No existing capabilities to modify — this is a greenfield frontend project. -->

## Impact

- **New project**: An entire Angular 19 SPA will be created in the workspace root.
- **Backend dependency**: Requires the Spring Boot backend running at `http://localhost:8080` with CORS configured to allow the Angular dev server origin.
- **Dependencies**: Angular 19, TailwindCSS v4, `@ngx-translate/core`, `@ngx-translate/http-loader`.
- **No backend changes required**: The frontend consumes the existing API as-is.
