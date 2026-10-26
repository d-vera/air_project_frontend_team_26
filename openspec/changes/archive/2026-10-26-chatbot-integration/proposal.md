## Why

Users of the Air Quality monitoring platform need quick, conversational access to environmental measurements, historical trends, and sensor status without having to manually navigate multiple dashboards, reports, and map views. By integrating the LangChain/DeepSeek-powered Air Quality Chatbot backend, authenticated users can ask natural language questions in Spanish and English directly within their workspace.

## What Changes

- Add a floating, expandable Chatbot Widget to the main application shell ([ShellComponent](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/layouts/shell/shell.component.ts)), accessible only to authenticated users.
- Configure development proxy routing in [proxy.conf.json](file:///Users/dennisvera/github/air_project_frontend_team_26/proxy.conf.json) to forward `/api/chat` requests to the chatbot microservice on port 8001 while keeping standard backend calls routed to port 8080.
- Create `ChatbotService` in core services to communicate with `POST /api/chat`, managing message streams, session-persisted conversation history, and error states.
- Support markdown rendering in assistant messages for readable formatting of measurement values, lists, and tables.
- Synchronize chatbot language and suggested prompts with [LanguageService](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/core/services/language.service.ts) (`ES` and `EN`).
- Implement quick suggestion prompt chips for common environmental queries.

## Capabilities

### New Capabilities
- `chatbot-assistant`: Floating interactive AI assistant widget integrated with the DeepSeek/LangChain air quality chatbot API, supporting authenticated message exchange, formatted markdown replies, session memory, localized suggestion prompts, and error handling.

### Modified Capabilities
<!-- None -->

## Impact

- **Frontend Core**: New service `ChatbotService` and models in `src/app/core/services/` and `src/app/models/`.
- **Frontend UI / Layout**: Update [ShellComponent](file:///Users/dennisvera/github/air_project_frontend_team_26/src/app/layouts/shell/shell.component.ts) to host the floating chat widget.
- **Dependencies**: Potential addition of lightweight markdown rendering or sanitizer utility for Angular standalone components.
- **Network / Proxy**: Update [proxy.conf.json](file:///Users/dennisvera/github/air_project_frontend_team_26/proxy.conf.json) and [environment.ts](file:///Users/dennisvera/github/air_project_frontend_team_26/src/environments/environment.ts) to support the chatbot backend at port 8001.
- **Authentication**: Reuses existing `authInterceptor` to supply JWT Bearer tokens to `/api/chat`.
