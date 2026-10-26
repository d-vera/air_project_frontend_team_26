import { Injectable, signal, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { ChatMessage, ChatRequest, ChatResponse } from '../../models/chatbot.model';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);
  private readonly STORAGE_KEY = 'air_chatbot_messages';
  private readonly MAX_HISTORY = 50;

  messages = signal<ChatMessage[]>(this.loadPersistedMessages());
  isOpen = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  toggleOpen(forcedState?: boolean): void {
    if (typeof forcedState === 'boolean') {
      this.isOpen.set(forcedState);
    } else {
      this.isOpen.set(!this.isOpen());
    }
  }

  setOpen(open: boolean): void {
    this.isOpen.set(open);
  }

  clearMessages(): void {
    this.messages.set([]);
    this.error.set(null);
    this.persistMessages([]);
  }

  sendMessage(userText: string): Observable<ChatResponse> {
    const trimmed = userText.trim();
    if (!trimmed) {
      return throwError(() => new Error('Message cannot be empty'));
    }

    const userMessage: ChatMessage = {
      id: this.generateId(),
      sender: 'user',
      text: trimmed,
      timestamp: Date.now()
    };

    // Append user message
    const updatedMessages = [...this.messages(), userMessage];
    this.messages.set(updatedMessages);
    this.persistMessages(updatedMessages);

    this.isLoading.set(true);
    this.error.set(null);

    const payload: ChatRequest = { message: trimmed };

    return this.http.post<ChatResponse>('/api/chat', payload).pipe(
      tap((res) => {
        this.isLoading.set(false);
        const assistantMessage: ChatMessage = {
          id: this.generateId(),
          sender: 'assistant',
          text: res.reply,
          language: res.language,
          timestamp: Date.now()
        };
        const currentWithReply = [...this.messages(), assistantMessage];
        this.messages.set(currentWithReply);
        this.persistMessages(currentWithReply);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const errorMessage = this.formatErrorMessage(err);
        this.error.set(errorMessage);

        const errorAssistantMsg: ChatMessage = {
          id: this.generateId(),
          sender: 'assistant',
          text: errorMessage,
          timestamp: Date.now(),
          isError: true
        };
        const currentWithError = [...this.messages(), errorAssistantMsg];
        this.messages.set(currentWithError);
        this.persistMessages(currentWithError);

        return throwError(() => err);
      })
    );
  }

  formatErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 401) {
      return 'Your session has expired. Please log in again to use the assistant.';
    }
    if (err.status === 422) {
      return 'Invalid message format. Please make sure your message is between 1 and 1000 characters.';
    }
    if (err.status === 502 || err.status === 500) {
      return 'The AI assistant service is temporarily unavailable. Please try again shortly.';
    }
    if (err.status === 0) {
      return 'Unable to connect to the assistant service. Please check your network connection.';
    }
    return err.error?.message || 'An unexpected error occurred while communicating with the assistant.';
  }

  private loadPersistedMessages(): ChatMessage[] {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return [];
    }
    try {
      const saved = sessionStorage.getItem(this.STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private persistMessages(messages: ChatMessage[]): void {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return;
    }
    try {
      const slice = messages.slice(-this.MAX_HISTORY);
      sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(slice));
    } catch {
      // Storage quota or serialization issue
    }
  }

  private generateId(): string {
    return 'msg_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
  }
}
