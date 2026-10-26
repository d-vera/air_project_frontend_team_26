## 1. Network Configuration & Models

- [x] 1.1 Update `proxy.conf.json` to route `/api/chat` to `http://localhost:8001` before the catch-all `/api` rule
- [x] 1.2 Define chatbot interfaces (`ChatRequest`, `ChatResponse`, `ChatMessage`, `ChatLanguage`) in `src/app/models/chatbot.model.ts`

## 2. Core Service Implementation

- [x] 2.1 Implement `ChatbotService` in `src/app/core/services/chatbot.service.ts` with `sendMessage()`, reactive signals, `sessionStorage` persistence, and 401/502 error handling
- [x] 2.2 Create unit tests in `src/app/core/services/chatbot.service.spec.ts` testing HTTP requests, response handling, error codes, and conversation clearing

## 3. Markdown Formatting Utility

- [x] 3.1 Create a safe markdown rendering pipe `MarkdownPipe` in `src/app/shared/pipes/markdown.pipe.ts` supporting bolding, lists, and safe sanitized HTML
- [x] 3.2 Create unit tests in `src/app/shared/pipes/markdown.pipe.spec.ts` verifying transformation of text, markdown elements, and safety against malicious scripts

## 4. Chatbot Widget Component

- [x] 4.1 Implement `ChatbotWidgetComponent` in `src/app/shared/components/chatbot-widget/chatbot-widget.component.ts` with floating trigger button, collapsible panel, localized prompt chips, message stream, and loading states
- [x] 4.2 Create unit tests in `src/app/shared/components/chatbot-widget/chatbot-widget.component.spec.ts` testing toggle state, message submission, suggestion clicks, and language updates

## 5. Shell Integration & Verification

- [x] 5.1 Add `ChatbotWidgetComponent` into `ShellComponent` in `src/app/layouts/shell/shell.component.ts`
- [x] 5.2 Run `ng build` and `npm test` to verify build integrity, full test suite pass, and zero regressions
