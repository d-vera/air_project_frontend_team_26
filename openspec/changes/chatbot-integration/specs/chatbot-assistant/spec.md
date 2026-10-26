## ADDED Requirements

### Requirement: Authenticated Chatbot Service Integration
The system SHALL provide a `ChatbotService` that sends user messages to the backend endpoint `POST /api/chat` using HTTP and receives `{ reply: string, language: 'ES' | 'EN' }`. The request SHALL include the user's active JWT Bearer authentication token.

#### Scenario: Successful message transmission
- **WHEN** an authenticated user submits a valid query message
- **THEN** the system sends a `POST /api/chat` request with the user's JWT token and receives an AI response containing `reply` and `language`

#### Scenario: Unauthorized error handling
- **WHEN** the chatbot endpoint responds with HTTP 401 Unauthorized
- **THEN** the system sets an error state indicating the user's session has expired and prompts them to log in again

#### Scenario: Service unavailable or bad gateway
- **WHEN** the chatbot endpoint responds with HTTP 500, 502, or fails to connect
- **THEN** the system presents a user-friendly error message indicating the assistant is currently unavailable and permits retry

---

### Requirement: Floating Chatbot Widget in Shell
The system SHALL render a floating chat widget pinned to the bottom-right corner of the application view within [ShellComponent](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/layouts/shell/shell.component.ts) for authenticated users.

#### Scenario: Toggle chat widget visibility
- **WHEN** the user clicks the floating chat toggle button
- **THEN** the chat window opens or collapses with a smooth transition

#### Scenario: Authentication visibility restriction
- **WHEN** a user is unauthenticated or visiting public login/register routes
- **THEN** the floating chat widget is not rendered in the view

---

### Requirement: Localized Starter Suggestions
The system SHALL present clickable suggested query prompts relevant to air quality monitoring, localized according to the current user language (`ES` or `EN`) from [LanguageService](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/core/services/language.service.ts).

#### Scenario: Display suggestions in Spanish
- **WHEN** the current application language is set to Spanish (`es` or `ES`)
- **THEN** the chat widget displays starter prompt chips in Spanish (e.g., "¿Cuál es la calidad de aire actual?", "¿Cuál es el promedio de CO2?")

#### Scenario: Display suggestions in English
- **WHEN** the current application language is set to English (`en` or `EN`)
- **THEN** the chat widget displays starter prompt chips in English (e.g., "What is the current air quality?", "What is the average CO2 level?")

#### Scenario: Clicking a suggestion prompt
- **WHEN** the user clicks any starter prompt chip
- **THEN** the system automatically populates and submits that query to the chatbot

---

### Requirement: Markdown Formatted Assistant Responses
The system SHALL format assistant replies using markdown rendering to display formatted text including bold headings, bulleted lists, and structured tabular data.

#### Scenario: Render formatted content
- **WHEN** the assistant reply contains markdown syntax (such as bold metrics, bullet lists, or tables)
- **THEN** the chat interface renders clean HTML elements reflecting the formatting safely

---

### Requirement: Session Conversation Persistence
The system SHALL store the current conversation message history in the browser session storage (`sessionStorage`) so that conversation history is retained while navigating between views.

#### Scenario: Retain messages across navigation
- **WHEN** a user exchanges messages with the chatbot and navigates to another page within the dashboard
- **THEN** the chat window restores the prior conversation history upon re-opening

#### Scenario: Clear conversation history
- **WHEN** the user clicks the "Clear Conversation" action in the chat header
- **THEN** the stored session history is erased and the conversation resets to the initial greeting state
