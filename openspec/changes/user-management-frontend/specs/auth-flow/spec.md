## ADDED Requirements

### Requirement: Visitor can register a new account
The system SHALL provide a registration form that collects email, password, first name, and last name. Upon valid submission, the system SHALL call `POST /api/auth/register` and store the returned JWT token to authenticate the user immediately.

#### Scenario: Successful registration
- **WHEN** a visitor fills in all required fields (email, password ≥8 chars, first name, last name) and submits the form
- **THEN** the system calls `POST /api/auth/register`, stores the returned JWT token, and redirects to the dashboard

#### Scenario: Email already registered
- **WHEN** a visitor submits a registration form with an email that already exists
- **THEN** the system displays a translated error message indicating the email is already registered (HTTP 409)

#### Scenario: Invalid form data
- **WHEN** a visitor submits the form with missing fields or a password shorter than 8 characters
- **THEN** the system displays inline validation errors and does not call the API

### Requirement: User can log in
The system SHALL provide a login form collecting email and password. Upon valid submission, the system SHALL call `POST /api/auth/login` and store the returned JWT token.

#### Scenario: Successful login
- **WHEN** a user enters valid credentials and submits the login form
- **THEN** the system calls `POST /api/auth/login`, stores the JWT token, and redirects to the dashboard

#### Scenario: Invalid credentials
- **WHEN** a user enters incorrect credentials
- **THEN** the system displays a translated error message (HTTP 401)

#### Scenario: Inactive account login attempt
- **WHEN** a user with an inactive account attempts to log in
- **THEN** the system displays a translated error message indicating the account is inactive (HTTP 401)

### Requirement: User can log out
The system SHALL provide a logout action that invalidates the current JWT token by calling `POST /api/auth/logout` and clears local state.

#### Scenario: Successful logout
- **WHEN** an authenticated user clicks the logout button
- **THEN** the system calls `POST /api/auth/logout`, removes the JWT token from localStorage, and redirects to the login page

### Requirement: Unauthenticated users are redirected to login
The system SHALL protect authenticated routes with a guard that redirects unauthenticated users to the login page.

#### Scenario: Unauthenticated access to protected route
- **WHEN** an unauthenticated user navigates to a protected route (e.g., `/dashboard`)
- **THEN** the system redirects them to `/login`

#### Scenario: Authenticated user accesses protected route
- **WHEN** an authenticated user navigates to a protected route
- **THEN** the system allows access and renders the page
