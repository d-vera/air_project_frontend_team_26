export type ChatLanguage = 'ES' | 'EN';

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  reply: string;
  language: ChatLanguage;
}

export interface ChatErrorResponse {
  error: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: number;
  language?: ChatLanguage;
  isError?: boolean;
}
