import {
  Component,
  signal,
  computed,
  inject,
  ElementRef,
  ViewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { LanguageService } from '../../../core/services/language.service';
import { MarkdownPipe } from '../../pipes/markdown.pipe';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownPipe],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col items-end">
      <!-- Chat Dialog Box -->
      @if (chatbotService.isOpen()) {
        <div
          class="w-[92vw] sm:w-[420px] h-[540px] max-h-[82vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3.5 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
          role="dialog"
          aria-label="Air Quality Assistant"
        >
          <!-- Header -->
          <div class="px-4 py-3 bg-gradient-to-r from-sky-600 to-blue-700 text-white flex items-center justify-between shadow-sm">
            <div class="flex items-center space-x-2.5">
              <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-xs">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-sky-600 rounded-full"></span>
              </div>
              <div>
                <h3 class="text-sm font-semibold leading-tight">
                  {{ isSpanish() ? 'Asistente de Aire' : 'Air Assistant' }}
                </h3>
                <p class="text-[11px] text-sky-100 flex items-center gap-1 font-medium">
                  DeepSeek &middot; LangChain
                </p>
              </div>
            </div>

            <!-- Header actions -->
            <div class="flex items-center space-x-1">
              @if (chatbotService.messages().length > 0) {
                <button
                  type="button"
                  (click)="clearHistory()"
                  class="p-1.5 rounded-lg text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
                  [title]="isSpanish() ? 'Limpiar conversación' : 'Clear conversation'"
                  aria-label="Clear chat history"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              }
              <button
                type="button"
                (click)="toggleOpen()"
                class="p-1.5 rounded-lg text-sky-100 hover:text-white hover:bg-white/10 transition-colors"
                [title]="isSpanish() ? 'Cerrar' : 'Close'"
                aria-label="Close assistant"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Message History -->
          <div #messageContainer class="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50">
            @if (chatbotService.messages().length === 0) {
              <!-- Empty state with welcome message and suggestion prompts -->
              <div class="py-4 text-center space-y-3">
                <div class="w-12 h-12 mx-auto rounded-2xl bg-sky-100 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shadow-xs">
                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {{ isSpanish() ? '¿En qué puedo ayudarte hoy?' : 'How can I assist you today?' }}
                  </h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[280px] mx-auto leading-relaxed">
                    {{
                      isSpanish()
                        ? 'Pregúntame sobre mediciones de CO2, temperatura, PM2.5 o estado de sensores.'
                        : 'Ask me about CO2 measurements, temperature, PM2.5, or sensor station status.'
                    }}
                  </p>
                </div>

                <!-- Suggested Quick Prompts -->
                <div class="pt-2 text-left space-y-1.5">
                  <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block px-1">
                    {{ isSpanish() ? 'Preguntas sugeridas' : 'Suggested questions' }}
                  </span>
                  <div class="flex flex-col gap-1.5">
                    @for (prompt of currentPrompts(); track prompt) {
                      <button
                        type="button"
                        (click)="selectPrompt(prompt)"
                        class="text-left text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:border-sky-500 dark:hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400 transition-all shadow-2xs group flex items-center justify-between"
                      >
                        <span class="truncate pr-2">{{ prompt }}</span>
                        <svg class="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    }
                  </div>
                </div>
              </div>
            } @else {
              <!-- Render Message List -->
              @for (msg of chatbotService.messages(); track msg.id) {
                @if (msg.sender === 'user') {
                  <div class="flex justify-end">
                    <div class="max-w-[85%] bg-sky-600 text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 text-xs shadow-xs break-words">
                      {{ msg.text }}
                    </div>
                  </div>
                } @else {
                  <div class="flex items-start gap-2 max-w-[90%]">
                    <div class="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold shadow-2xs"
                         [ngClass]="msg.isError ? 'bg-rose-500 text-white' : 'bg-sky-600 text-white'">
                      @if (msg.isError) {
                        !
                      } @else {
                        AI
                      }
                    </div>
                    <div
                      class="rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs shadow-2xs border break-words"
                      [ngClass]="msg.isError
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'"
                    >
                      @if (msg.isError) {
                        <p class="font-medium">{{ msg.text }}</p>
                      } @else {
                        <div [innerHTML]="msg.text | markdown"></div>
                      }
                    </div>
                  </div>
                }
              }
            }

            <!-- Typing / Loading state -->
            @if (chatbotService.isLoading()) {
              <div class="flex items-start gap-2">
                <div class="w-6 h-6 rounded-full bg-sky-600 text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0">
                  AI
                </div>
                <div class="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-tl-xs px-3.5 py-2.5 text-xs flex items-center space-x-1.5 shadow-2xs">
                  <span class="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span class="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span class="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></span>
                  <span class="text-[11px] text-slate-400 pl-1.5 font-medium">
                    {{ isSpanish() ? 'Consultando datos...' : 'Querying data...' }}
                  </span>
                </div>
              </div>
            }
          </div>

          <!-- Input Footer -->
          <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form (ngSubmit)="sendUserMessage()" class="flex items-center space-x-2">
              <input
                type="text"
                [(ngModel)]="userInput"
                name="userInput"
                [placeholder]="isSpanish() ? 'Pregunta sobre la calidad del aire...' : 'Ask about air quality measurements...'"
                [disabled]="chatbotService.isLoading()"
                maxlength="1000"
                class="flex-1 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-sky-500 dark:focus:border-sky-500 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden transition-all disabled:opacity-50"
                autocomplete="off"
              />
              <button
                type="submit"
                [disabled]="!canSend()"
                class="p-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs shrink-0"
                [attr.aria-label]="isSpanish() ? 'Enviar mensaje' : 'Send message'"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      }

      <!-- Floating Trigger Button (FAB) -->
      <button
        type="button"
        (click)="toggleOpen()"
        class="relative w-13 h-13 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center focus:outline-hidden focus:ring-4 focus:ring-sky-500/30 group"
        [attr.aria-label]="isSpanish() ? 'Abrir Asistente de Calidad del Aire' : 'Open Air Quality Assistant'"
        [attr.aria-expanded]="chatbotService.isOpen()"
      >
        @if (chatbotService.isOpen()) {
          <svg class="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        } @else {
          <svg class="w-6 h-6 transition-transform group-hover:scale-110 duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span class="absolute -top-1 -right-1 flex h-3.5 w-3.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
          </span>
        }
      </button>
    </div>
  `
})
export class ChatbotWidgetComponent {
  chatbotService = inject(ChatbotService);
  languageService = inject(LanguageService);

  @ViewChild('messageContainer') messageContainer?: ElementRef<HTMLDivElement>;

  userInput = '';

  isSpanish = computed(() => {
    return this.languageService.currentLangPreference() === 'ES';
  });

  currentPrompts = computed(() => {
    return this.isSpanish()
      ? [
          '¿Cuál es el promedio de CO2 en la última semana?',
          '¿Cuál es la calidad de aire actual en Cochabamba?',
          '¿Qué sensores han excedido los umbrales seguros?',
          '¿Cuál es la temperatura y humedad promedio hoy?'
        ]
      : [
          'What is the average CO2 level in the past week?',
          'What is the current air quality in Cochabamba?',
          'Which sensors have exceeded safe thresholds?',
          'What is the average temperature and humidity today?'
        ];
  });

  constructor() {
    effect(() => {
      // Trigger scroll whenever messages signal changes or loading changes
      this.chatbotService.messages();
      this.chatbotService.isLoading();
      this.scrollToBottom();
    });
  }

  canSend(): boolean {
    return !!this.userInput.trim() && !this.chatbotService.isLoading();
  }

  toggleOpen(): void {
    this.chatbotService.toggleOpen();
    if (this.chatbotService.isOpen()) {
      this.scrollToBottom();
    }
  }

  selectPrompt(promptText: string): void {
    this.userInput = promptText;
    this.sendUserMessage();
  }

  sendUserMessage(): void {
    const text = this.userInput.trim();
    if (!text || this.chatbotService.isLoading()) return;

    this.userInput = '';
    this.chatbotService.sendMessage(text).subscribe({
      next: () => this.scrollToBottom(),
      error: () => this.scrollToBottom()
    });
  }

  clearHistory(): void {
    this.chatbotService.clearMessages();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      if (this.messageContainer?.nativeElement) {
        this.messageContainer.nativeElement.scrollTop = this.messageContainer.nativeElement.scrollHeight;
      }
    }, 50);
  }
}
