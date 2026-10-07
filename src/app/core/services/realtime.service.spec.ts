import { TestBed } from '@angular/core/testing';
import { RealtimeService } from './realtime.service';
import { AuthService } from './auth.service';
import { signal } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('RealtimeService', () => {
  let service: RealtimeService;
  let mockAuthService: { token: ReturnType<typeof signal<string | null>> };
  let mockStompClient: any;

  beforeEach(() => {
    mockAuthService = {
      token: signal<string | null>(null)
    };

    let mockActive = false;
    let mockConnected = false;

    vi.spyOn(Client.prototype, 'active', 'get').mockImplementation(() => mockActive);
    vi.spyOn(Client.prototype, 'connected', 'get').mockImplementation(() => mockConnected);

    vi.spyOn(Client.prototype, 'activate').mockImplementation(function (this: any) {
      mockActive = true;
      mockConnected = true;
      if (this.onConnect) this.onConnect();
      return undefined as any;
    });

    vi.spyOn(Client.prototype, 'deactivate').mockImplementation(function (this: any) {
      mockActive = false;
      mockConnected = false;
      if (this.onDisconnect) this.onDisconnect();
      return Promise.resolve();
    });

    vi.spyOn(Client.prototype, 'subscribe').mockImplementation(function (this: any, topic: string, callback: any) {
      return {
        id: 'sub-1',
        unsubscribe: vi.fn()
      } as any;
    });


    TestBed.configureTestingModule({
      providers: [
        RealtimeService,
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(RealtimeService);
  });

  afterEach(() => {
    service.deactivate();
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
    expect(service.connectionState()).toBe('DISCONNECTED');
  });

  it('should not connect if there is no token', () => {
    mockAuthService.token.set(null);
    service.activate();
    expect(service.connectionState()).toBe('DISCONNECTED');
  });

  it('should connect and update connectionState to CONNECTED when token exists', () => {
    mockAuthService.token.set('fake-jwt-token');
    service.activate();
    expect(service.connectionState()).toBe('CONNECTED');
  });

  it('should subscribe to default topics on connect and broadcast readings', () => {
    mockAuthService.token.set('fake-jwt-token');

    let receivedReading: any = null;
    service.readings$.subscribe((reading) => {
      receivedReading = reading;
    });

    // Simulate topic subscription callback
    let readingCallback: any = null;
    vi.spyOn(Client.prototype, 'subscribe').mockImplementation((topic: string, cb: any) => {
      if (topic === '/topic/readings') {
        readingCallback = cb;
      }
      return { id: 'sub-id', unsubscribe: vi.fn() };
    });

    service.activate();

    expect(readingCallback).toBeTruthy();

    const mockMessage: IMessage = {
      body: JSON.stringify({
        action: 'INSERT',
        id: 10,
        sensorUid: 'ESP32_001',
        deviceName: 'Living Room',
        timestamp: '2026-10-05T19:00:00Z',
        temperature: 24.5,
        humidity: 50.0,
        co2: 420.0
      }),
      headers: {},
      command: 'MESSAGE',
      isBinaryBody: false,
      binaryBody: new Uint8Array(),
      ack: vi.fn(),
      nack: vi.fn()
    };

    readingCallback(mockMessage);

    expect(receivedReading).toEqual({
      action: 'INSERT',
      id: 10,
      sensorUid: 'ESP32_001',
      deviceName: 'Living Room',
      timestamp: '2026-10-05T19:00:00Z',
      temperature: 24.5,
      humidity: 50.0,
      co2: 420.0
    });
  });

  it('should broadcast sensor status changes when message received on /topic/sensors/status', () => {
    mockAuthService.token.set('fake-jwt-token');

    let receivedStatus: any = null;
    service.sensorStatus$.subscribe((status) => {
      receivedStatus = status;
    });

    let statusCallback: any = null;
    vi.spyOn(Client.prototype, 'subscribe').mockImplementation((topic: string, cb: any) => {
      if (topic === '/topic/sensors/status') {
        statusCallback = cb;
      }
      return { id: 'sub-id', unsubscribe: vi.fn() };
    });

    service.activate();

    const mockMessage: IMessage = {
      body: JSON.stringify({
        sensorId: 1,
        uidSensor: 'ESP32_001',
        name: 'Sensor 1',
        previousStatus: 'OFFLINE',
        newStatus: 'ONLINE',
        active: true,
        lastSeen: '2026-10-05T18:30:00Z'
      }),
      headers: {},
      command: 'MESSAGE',
      isBinaryBody: false,
      binaryBody: new Uint8Array(),
      ack: vi.fn(),
      nack: vi.fn()
    };


    statusCallback(mockMessage);

    expect(receivedStatus).toEqual({
      sensorId: 1,
      uidSensor: 'ESP32_001',
      name: 'Sensor 1',
      previousStatus: 'OFFLINE',
      newStatus: 'ONLINE',
      active: true,
      lastSeen: '2026-10-05T18:30:00Z'
    });
  });

  it('should unsubscribe and disconnect gracefully on deactivate()', () => {
    mockAuthService.token.set('fake-jwt-token');
    service.activate();
    expect(service.connectionState()).toBe('CONNECTED');

    service.deactivate();
    expect(service.connectionState()).toBe('DISCONNECTED');
  });
});
