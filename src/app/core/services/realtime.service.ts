import { Injectable, inject, effect, OnDestroy, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { AuthService } from './auth.service';
import { AirQualityReadingNotification, SensorStatusNotification } from '../../models/websocket.model';
import { environment } from '../../../environments/environment';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR';

@Injectable({
  providedIn: 'root'
})
export class RealtimeService implements OnDestroy {
  private authService = inject(AuthService);

  private client: Client | null = null;
  private readingsSubject = new Subject<AirQualityReadingNotification>();
  private sensorStatusSubject = new Subject<SensorStatusNotification>();

  public readonly readings$ = this.readingsSubject.asObservable();
  public readonly sensorStatus$ = this.sensorStatusSubject.asObservable();

  public readonly connectionState = signal<ConnectionState>('DISCONNECTED');

  private activeSubscriptions = new Map<string, StompSubscription>();

  constructor() {
    // Automatically manage connection lifecycle based on auth state
    effect(() => {
      const token = this.authService.token();
      if (token) {
        this.activate();
      } else {
        this.deactivate();
      }
    });
  }

  /**
   * Initializes and activates the STOMP Client.
   */
  public activate(): void {
    const token = this.authService.token();
    if (!token) {
      this.connectionState.set('DISCONNECTED');
      return;
    }

    if (this.client?.active) {
      return;
    }

    this.connectionState.set('CONNECTING');

    const wsUrl = environment.wsUrl || 'http://localhost:8080/ws';

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        if (!environment.production) {
          console.log('[STOMP]:', str);
        }
      },
      onConnect: () => {
        this.connectionState.set('CONNECTED');
        this.setupDefaultSubscriptions();
      },
      onDisconnect: () => {
        this.connectionState.set('DISCONNECTED');
        this.activeSubscriptions.clear();
      },
      onStompError: (frame) => {
        console.error('[STOMP Error]:', frame.headers['message'], frame.body);
        this.connectionState.set('ERROR');
      },
      onWebSocketClose: () => {
        if (this.connectionState() !== 'DISCONNECTED') {
          this.connectionState.set('CONNECTING');
        }
      }
    });

    this.client.activate();
  }

  /**
   * Disconnects and deactivates the STOMP client.
   */
  public deactivate(): void {
    this.activeSubscriptions.forEach((sub) => sub.unsubscribe());
    this.activeSubscriptions.clear();

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connectionState.set('DISCONNECTED');
  }

  /**
   * Sets up default subscriptions when connected.
   */
  private setupDefaultSubscriptions(): void {
    this.subscribeToTopic('/topic/readings', (message: IMessage) => {
      try {
        const payload: AirQualityReadingNotification = JSON.parse(message.body);
        this.readingsSubject.next(payload);
      } catch (err) {
        console.error('Failed to parse reading notification:', err);
      }
    });

    this.subscribeToTopic('/topic/sensors/status', (message: IMessage) => {
      try {
        const payload: SensorStatusNotification = JSON.parse(message.body);
        this.sensorStatusSubject.next(payload);
      } catch (err) {
        console.error('Failed to parse sensor status notification:', err);
      }
    });
  }

  /**
   * Helper to subscribe to any topic with caching to avoid duplicate subscriptions.
   */
  public subscribeToTopic(topic: string, callback: (message: IMessage) => void): StompSubscription | null {
    if (!this.client || !this.client.connected) {
      return null;
    }

    if (this.activeSubscriptions.has(topic)) {
      return this.activeSubscriptions.get(topic)!;
    }

    const sub = this.client.subscribe(topic, callback);
    this.activeSubscriptions.set(topic, sub);
    return sub;
  }

  /**
   * Unsubscribe from a topic.
   */
  public unsubscribeFromTopic(topic: string): void {
    const sub = this.activeSubscriptions.get(topic);
    if (sub) {
      sub.unsubscribe();
      this.activeSubscriptions.delete(topic);
    }
  }

  /**
   * Dynamic subscription for a specific sensor readings topic: /topic/readings/{sensorUid}
   */
  public subscribeToSensorReadings(sensorUid: string): Observable<AirQualityReadingNotification> {
    const topic = `/topic/readings/${sensorUid}`;
    const specificSubject = new Subject<AirQualityReadingNotification>();

    if (this.client && this.client.connected) {
      this.subscribeToTopic(topic, (message: IMessage) => {
        try {
          const payload: AirQualityReadingNotification = JSON.parse(message.body);
          specificSubject.next(payload);
        } catch (err) {
          console.error(`Failed to parse reading for ${sensorUid}:`, err);
        }
      });
    }

    return specificSubject.asObservable();
  }

  ngOnDestroy(): void {
    this.deactivate();
  }
}
