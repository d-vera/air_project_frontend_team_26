## Context

The Air Quality Monitoring Platform has an authenticated frontend in Angular and two backend services:
1. Main application backend (Scala/ZIO) on port `8080`, handling user authentication, profile data, sensor metadata, and thresholds.
2. AI Chatbot service (FastAPI + LangChain) on port `8001`, providing environmental question-answering with DeepSeek as the underlying LLM.

The chatbot backend exposes `POST /api/chat`, requiring a JWT `Authorization: Bearer <token>` matching the auth session issued by the main backend. The response format is `{ "reply": string, "language": "ES" | "EN" }`.

## Goals / Non-Goals

**Goals:**
- Provide a floating, non-intrusive chat widget embedded in [ShellComponent](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/layouts/shell/shell.component.ts) that is accessible across all authenticated pages.
- Integrate `ChatbotService` to call `POST /api/chat` with JWT Bearer tokens supplied automatically by [authInterceptor](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/core/interceptors/auth.interceptor.ts).
- Update development proxy configuration ([proxy.conf.json](file:///Users/dennisvera/github/air_project_frontend_team_26/proxy.conf.json)) to route `/api/chat` calls to `http://localhost:8001`.
- Display helpful starter prompts in the user's active language (`ES` or `EN`), synchronized with [LanguageService](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/core/services/language.service.ts).
- Format assistant replies with markdown rendering (lists, bold text, metrics, tables).
- Persist ongoing conversation in browser session storage (`sessionStorage`) so users can navigate between Dashboard, Map, and Reports without losing conversational context.
- Gracefully handle unauthorized (401), rate-limited (429), or backend failure (502) scenarios.

**Non-Goals:**
- Calling DeepSeek API directly from the browser (bypasses LangChain sensor tool access and exposes secrets).
- Unauthenticated public chat on `/login` or `/register` pages.
- Server-side persistent chat history database storage across multiple days/devices (frontend session storage is sufficient).
- Real-time streaming tokens (backend endpoint returns complete `{ reply, language }` response).

## Decisions

### 1. Dedicated Floating Widget Component vs Dedicated Route
- **Decision**: Implement a standalone `ChatbotWidgetComponent` pinned to the bottom-right of `ShellComponent`.
- **Rationale**: Environmental queries often arise while examining real-time charts, maps, or reports. A floating widget allows users to consult the AI assistant contextually without disrupting their current view.
- **Alternatives Considered**: Full `/chat` page (forces user away from dashboard data).

### 2. Microservice Proxy Routing in Angular Dev Server
- **Decision**: Add an exact `/api/chat` entry before the general `/api` proxy rule in `proxy.conf.json` targeting `http://localhost:8001`.
- **Rationale**: Allows the frontend to make clean relative HTTP calls (`/api/chat`), letting the existing `authInterceptor` automatically attach tokens and avoiding CORS issues in local development.
- **Alternatives Considered**: Direct hardcoded absolute URLs (`http://localhost:8001/api/chat`) which complicates environment switching and triggers CORS preflights.

### 3. Markdown Formatting Strategy
- **Decision**: Implement a lightweight, secure markdown parsing and HTML sanitization pipe/utility (or marked + DOMPurify) tailored for Angular standalone components.
- **Rationale**: Assistant replies contain tabular sensor readings, bold warnings, and bulleted recommendations that look poorly formatted as raw plain text.
- **Alternatives Considered**: Raw text with `white-space: pre-wrap` (lacks formatting for tables and links).

### 4. Language Synchronization
- **Decision**: Read `languageService.currentLangPreference()` (`'ES' | 'EN'`) and listen to signal changes to update starter prompt chips dynamically.
- **Rationale**: Keeps the chatbot user experience seamlessly localized with the rest of the application.
- **Alternatives Considered**: Hardcoded English prompts or letting the backend guess solely from message content.

## Risks / Trade-offs

- **[Risk]** Chatbot backend is offline or returns 502/500 errors when DeepSeek is slow or unreachable.
  → **Mitigation**: Implement explicit error banners in the chat widget with a retry option and friendly status feedback ("Assistant temporarily unavailable").
- **[Risk]** Session token expires while chat window is open.
  → **Mitigation**: The `ChatbotService` catches 401 responses and informs the user their session expired, preventing infinite retries.
- **[Risk]** Storing large chat history in `sessionStorage` could exceed storage limits.
  → **Mitigation**: Cap session history to the most recent 50 messages, and provide a "Clear Chat" button.
