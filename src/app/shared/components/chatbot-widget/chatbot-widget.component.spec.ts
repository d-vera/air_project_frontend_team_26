import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { signal } from '@angular/core';
import { ChatbotWidgetComponent } from './chatbot-widget.component';
import { ChatbotService } from '../../../core/services/chatbot.service';
import { LanguageService } from '../../../core/services/language.service';
import { ChatMessage, ChatResponse } from '../../../models/chatbot.model';

describe('ChatbotWidgetComponent', () => {
  let component: ChatbotWidgetComponent;
  let fixture: ComponentFixture<ChatbotWidgetComponent>;
  let chatbotService: ChatbotService;
  let mockLanguageService: {
    currentLangPreference: ReturnType<typeof signal<'ES' | 'EN'>>;
  };

  beforeEach(async () => {
    mockLanguageService = {
      currentLangPreference: signal<'ES' | 'EN'>('ES')
    };

    await TestBed.configureTestingModule({
      imports: [ChatbotWidgetComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ChatbotService,
        { provide: LanguageService, useValue: mockLanguageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotWidgetComponent);
    component = fixture.componentInstance;
    chatbotService = TestBed.inject(ChatbotService);
    fixture.detectChanges();
  });

  it('should create the chatbot widget component', () => {
    expect(component).toBeTruthy();
    expect(chatbotService.isOpen()).toBe(false);
  });

  it('should toggle chat window when clicking FAB trigger', () => {
    const fab = fixture.nativeElement.querySelector('button[aria-label="Abrir Asistente de Calidad del Aire"]');
    expect(fab).toBeTruthy();

    fab.click();
    fixture.detectChanges();

    expect(chatbotService.isOpen()).toBe(true);

    const dialog = fixture.nativeElement.querySelector('div[role="dialog"]');
    expect(dialog).toBeTruthy();

    // Toggle close
    component.toggleOpen();
    fixture.detectChanges();
    expect(chatbotService.isOpen()).toBe(false);
  });

  it('should display Spanish suggestions and header when language is ES', () => {
    chatbotService.setOpen(true);
    fixture.detectChanges();

    expect(component.isSpanish()).toBe(true);
    const header = fixture.nativeElement.querySelector('h3');
    expect(header.textContent).toContain('Asistente de Aire');

    const prompts = component.currentPrompts();
    expect(prompts[0]).toContain('¿Cuál es el promedio de CO2');

    const promptButtons = fixture.nativeElement.querySelectorAll('div[role="dialog"] button span.truncate');
    expect(promptButtons.length).toBeGreaterThan(0);
    expect(promptButtons[0].textContent).toContain('¿Cuál es el promedio de CO2');
  });

  it('should switch suggestions and header to English when language preference changes', () => {
    mockLanguageService.currentLangPreference.set('EN');
    chatbotService.setOpen(true);
    fixture.detectChanges();

    expect(component.isSpanish()).toBe(false);
    const header = fixture.nativeElement.querySelector('h3');
    expect(header.textContent).toContain('Air Assistant');

    const prompts = component.currentPrompts();
    expect(prompts[0]).toContain('What is the average CO2 level');
  });

  it('should send user message when typing in input and submitting', () => {
    chatbotService.setOpen(true);
    fixture.detectChanges();

    const sendSpy = vi.spyOn(chatbotService, 'sendMessage').mockReturnValue(
      of({ reply: 'Test reply', language: 'ES' })
    );

    component.userInput = 'How are the sensors?';
    expect(component.canSend()).toBe(true);

    component.sendUserMessage();

    expect(sendSpy).toHaveBeenCalledWith('How are the sensors?');
    expect(component.userInput).toBe('');
  });

  it('should select prompt chip and immediately trigger message submission', () => {
    chatbotService.setOpen(true);
    fixture.detectChanges();

    const sendSpy = vi.spyOn(chatbotService, 'sendMessage').mockReturnValue(
      of({ reply: 'CO2 is good', language: 'ES' })
    );

    const prompt = component.currentPrompts()[0];
    component.selectPrompt(prompt);

    expect(sendSpy).toHaveBeenCalledWith(prompt);
  });

  it('should render message bubbles for user and assistant', () => {
    const mockMessages: ChatMessage[] = [
      { id: '1', sender: 'user', text: 'Hello bot', timestamp: 1000 },
      { id: '2', sender: 'assistant', text: 'Hello! **AQI** is *good*.', timestamp: 1001, language: 'EN' }
    ];
    chatbotService.messages.set(mockMessages);
    chatbotService.setOpen(true);
    fixture.detectChanges();

    const userBubble = fixture.nativeElement.querySelector('.bg-sky-600.text-white');
    expect(userBubble.textContent).toContain('Hello bot');

    const assistantBubble = fixture.nativeElement.querySelector('.rounded-2xl.rounded-tl-xs');
    expect(assistantBubble).toBeTruthy();
    expect(assistantBubble.innerHTML).toContain('AQI');
    expect(assistantBubble.innerHTML).toContain('<strong class="font-semibold">AQI</strong>');
  });

  it('should render error message with error styling when isError is true', () => {
    const errorMsg: ChatMessage = {
      id: 'err1',
      sender: 'assistant',
      text: 'Your session has expired. Please log in again.',
      timestamp: 1002,
      isError: true
    };
    chatbotService.messages.set([errorMsg]);
    chatbotService.setOpen(true);
    fixture.detectChanges();

    const errorBubble = fixture.nativeElement.querySelector('.bg-rose-50');
    expect(errorBubble).toBeTruthy();
    expect(errorBubble.textContent).toContain('Your session has expired');
  });

  it('should clear history when clear button is clicked', () => {
    chatbotService.messages.set([
      { id: '1', sender: 'user', text: 'Clear me', timestamp: 1000 }
    ]);
    chatbotService.setOpen(true);
    fixture.detectChanges();

    const clearSpy = vi.spyOn(chatbotService, 'clearMessages');
    component.clearHistory();

    expect(clearSpy).toHaveBeenCalled();
  });
});
