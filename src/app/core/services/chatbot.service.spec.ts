import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ChatbotService } from './chatbot.service';
import { ChatResponse } from '../../models/chatbot.model';

// Mock sessionStorage for test environment
const sessionStore: Record<string, string> = {};
const mockSessionStorage = {
  getItem: (key: string): string | null => sessionStore[key] ?? null,
  setItem: (key: string, value: string): void => { sessionStore[key] = value; },
  removeItem: (key: string): void => { delete sessionStore[key]; },
  clear: (): void => { Object.keys(sessionStore).forEach(key => delete sessionStore[key]); },
  get length(): number { return Object.keys(sessionStore).length; },
  key: (index: number): string | null => Object.keys(sessionStore)[index] ?? null,
};

Object.defineProperty(globalThis, 'sessionStorage', { value: mockSessionStorage, writable: true });

describe('ChatbotService', () => {
  let service: ChatbotService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    mockSessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        ChatbotService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(ChatbotService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    mockSessionStorage.clear();
  });

  it('should be created and initialized with default signals', () => {
    expect(service).toBeTruthy();
    expect(service.messages()).toEqual([]);
    expect(service.isOpen()).toBe(false);
    expect(service.isLoading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('should toggle and set chat open state', () => {
    expect(service.isOpen()).toBe(false);
    service.toggleOpen();
    expect(service.isOpen()).toBe(true);
    service.toggleOpen();
    expect(service.isOpen()).toBe(false);

    service.setOpen(true);
    expect(service.isOpen()).toBe(true);
    service.setOpen(false);
    expect(service.isOpen()).toBe(false);

    service.toggleOpen(true);
    expect(service.isOpen()).toBe(true);
    service.toggleOpen(false);
    expect(service.isOpen()).toBe(false);
  });

  describe('sendMessage', () => {
    it('should throw an error and not make HTTP call if message is empty or whitespace', () => {
      let errorThrown: any = null;
      service.sendMessage('   ').subscribe({
        error: (err) => {
          errorThrown = err;
        }
      });
      expect(errorThrown).not.toBeNull();
      expect(errorThrown.message).toBe('Message cannot be empty');
      expect(service.messages().length).toBe(0);
      httpTesting.expectNone('/api/chat');
    });

    it('should post message to /api/chat and update messages on success', () => {
      const mockResponse: ChatResponse = {
        reply: 'El promedio de CO2 es 412 ppm.',
        language: 'ES'
      };

      service.sendMessage('¿Cuál es el promedio de CO2?').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      // User message should immediately be added
      expect(service.messages().length).toBe(1);
      expect(service.messages()[0].sender).toBe('user');
      expect(service.messages()[0].text).toBe('¿Cuál es el promedio de CO2?');
      expect(service.isLoading()).toBe(true);

      const req = httpTesting.expectOne('/api/chat');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ message: '¿Cuál es el promedio de CO2?' });

      req.flush(mockResponse);

      expect(service.isLoading()).toBe(false);
      expect(service.messages().length).toBe(2);
      expect(service.messages()[1].sender).toBe('assistant');
      expect(service.messages()[1].text).toBe(mockResponse.reply);
      expect(service.messages()[1].language).toBe('ES');
      expect(service.error()).toBeNull();
    });

    it('should handle 401 Unauthorized by adding error message and setting error signal', () => {
      service.sendMessage('Hello').subscribe({
        error: (err) => {
          expect(err.status).toBe(401);
        }
      });

      const req = httpTesting.expectOne('/api/chat');
      req.flush({ error: 'unauthorized', message: 'Invalid or expired JWT token' }, { status: 401, statusText: 'Unauthorized' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toContain('session has expired');
      expect(service.messages().length).toBe(2);
      expect(service.messages()[1].isError).toBe(true);
      expect(service.messages()[1].text).toContain('session has expired');
    });

    it('should handle 502 Bad Gateway and 500 Internal Server Error', () => {
      service.sendMessage('Hello').subscribe({
        error: (err) => {
          expect(err.status).toBe(502);
        }
      });

      const req = httpTesting.expectOne('/api/chat');
      req.flush({ error: 'bad_gateway', message: 'LLM failed' }, { status: 502, statusText: 'Bad Gateway' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toContain('temporarily unavailable');
    });

    it('should handle 422 Unprocessable Entity for invalid length', () => {
      service.sendMessage('Too long').subscribe({
        error: (err) => {
          expect(err.status).toBe(422);
        }
      });

      const req = httpTesting.expectOne('/api/chat');
      req.flush({ error: 'unprocessable', message: 'Too long' }, { status: 422, statusText: 'Unprocessable Entity' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toContain('between 1 and 1000 characters');
    });

    it('should handle status 0 network connection errors', () => {
      service.sendMessage('Check').subscribe({
        error: (err) => {
          expect(err.status).toBe(0);
        }
      });

      const req = httpTesting.expectOne('/api/chat');
      req.error(new ProgressEvent('error'));

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toContain('network connection');
    });

    it('should handle custom error message from server for other statuses', () => {
      service.sendMessage('Check').subscribe({
        error: (err) => {
          expect(err.status).toBe(400);
        }
      });

      const req = httpTesting.expectOne('/api/chat');
      req.flush({ error: 'bad_request', message: 'Custom message from server' }, { status: 400, statusText: 'Bad Request' });

      expect(service.isLoading()).toBe(false);
      expect(service.error()).toBe('Custom message from server');
    });
  });

  describe('clearMessages and persistence', () => {
    it('should clear messages and remove from sessionStorage', () => {
      const mockResponse: ChatResponse = { reply: 'Response', language: 'EN' };
      service.sendMessage('Test').subscribe();
      const req = httpTesting.expectOne('/api/chat');
      req.flush(mockResponse);

      expect(service.messages().length).toBe(2);

      service.clearMessages();
      expect(service.messages().length).toBe(0);
      expect(service.error()).toBeNull();
      expect(mockSessionStorage.getItem('air_chatbot_messages')).toBe('[]');
    });

    it('should restore persisted messages from sessionStorage upon service creation', () => {
      const mockMessages = [
        { id: '1', sender: 'user' as const, text: 'Hi', timestamp: 123456 },
        { id: '2', sender: 'assistant' as const, text: 'Hello', timestamp: 123457 }
      ];
      mockSessionStorage.setItem('air_chatbot_messages', JSON.stringify(mockMessages));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        providers: [
          ChatbotService,
          provideHttpClient(),
          provideHttpClientTesting()
        ]
      });

      const reloadedService = TestBed.inject(ChatbotService);
      expect(reloadedService.messages()).toEqual(mockMessages);
    });
  });
});
