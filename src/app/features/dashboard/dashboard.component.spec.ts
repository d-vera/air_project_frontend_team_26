import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError, Subject } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { AuthService } from '../../core/services/auth.service';
import { SensorService } from '../../core/services/sensor.service';
import { AirQualityService } from '../../core/services/air-quality.service';
import { RealtimeService } from '../../core/services/realtime.service';
import { UserService } from '../../core/services/user.service';
import { Sensor } from '../../models/sensor.model';
import { AirQualityReadingNotification, SensorStatusNotification } from '../../models/websocket.model';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockAuthService: any;
  let mockSensorService: any;
  let mockAirQualityService: any;
  let mockUserService: any;
  let mockRealtimeService: any;
  let readingsSubject: Subject<AirQualityReadingNotification>;
  let sensorStatusSubject: Subject<SensorStatusNotification>;

  const mockSensors: Sensor[] = [
    {
      id: 1,
      uidSensor: 'ACEA5AC8E720',
      name: 'Central Sensor',
      sensorType: 'ESP32_AIR',
      latitude: -12.046374,
      longitude: -77.042793,
      firmwareVersion: '1.0.2',
      sensorStatus: 'ONLINE',
      lastSeen: new Date().toISOString(),
      userId: 1,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      uidSensor: 'B189DF621C11',
      name: 'North Sensor',
      sensorType: 'ESP32_AIR',
      latitude: -12.05211,
      longitude: -77.03652,
      firmwareVersion: '1.0.1',
      sensorStatus: 'OFFLINE',
      lastSeen: new Date().toISOString(),
      userId: 2,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      uidSensor: 'C993AF718223',
      name: 'South Sensor',
      sensorType: 'ESP32_AIR',
      latitude: -12.06145,
      longitude: -77.04891,
      firmwareVersion: '1.0.0',
      sensorStatus: 'MAINTENANCE',
      lastSeen: null,
      userId: null,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  beforeEach(async () => {
    readingsSubject = new Subject<AirQualityReadingNotification>();
    sensorStatusSubject = new Subject<SensorStatusNotification>();

    mockAuthService = {
      isAuthenticated: vi.fn().mockReturnValue(false),
      isAdmin: vi.fn().mockReturnValue(false),
      getUserEmail: vi.fn().mockReturnValue(''),
      getCurrentUser: vi.fn().mockReturnValue(null),
      hasRole: vi.fn().mockReturnValue(false)
    };

    mockSensorService = {
      getSensors: vi.fn().mockReturnValue(of(mockSensors)),
      getSensorsStream: vi.fn().mockReturnValue(of(mockSensors)),
      sensors$: of(mockSensors),
      handleStatusNotification: vi.fn()
    };

    mockAirQualityService = {
      getCurrentReadings: vi.fn().mockReturnValue(of({ readings: [] })),
      getHistoricalReadings: vi.fn().mockReturnValue(of([]))
    };

    mockUserService = {
      getCurrentUser: vi.fn().mockReturnValue(of(null))
    };

    mockRealtimeService = {
      readings$: readingsSubject.asObservable(),
      sensorStatus$: sensorStatusSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService(),
        { provide: AuthService, useValue: mockAuthService },
        { provide: SensorService, useValue: mockSensorService },
        { provide: AirQualityService, useValue: mockAirQualityService },
        { provide: UserService, useValue: mockUserService },
        { provide: RealtimeService, useValue: mockRealtimeService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load sensors with ONLINE, OFFLINE, and MAINTENANCE statuses', () => {
    fixture.detectChanges();
    const sensors = component.sensors();
    expect(sensors.length).toBe(3);
    expect(sensors.some(s => s.sensorStatus === 'ONLINE')).toBe(true);
    expect(sensors.some(s => s.sensorStatus === 'OFFLINE')).toBe(true);
    expect(sensors.some(s => s.sensorStatus === 'MAINTENANCE')).toBe(true);
  });

  it('should use fallback sensors with all three statuses if service returns empty or errors', () => {
    mockSensorService.getSensors.mockReturnValue(throwError(() => new Error('API Error')));
    fixture.detectChanges();
    const sensors = component.sensors();
    expect(sensors.length).toBeGreaterThanOrEqual(3);
    expect(sensors.some(s => s.sensorStatus === 'ONLINE')).toBe(true);
    expect(sensors.some(s => s.sensorStatus === 'OFFLINE')).toBe(true);
    expect(sensors.some(s => s.sensorStatus === 'MAINTENANCE')).toBe(true);
  });

  it('should select device when sensor is selected from map', () => {
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'onDeviceChange');
    component.onMapSensorSelected(mockSensors[0]);
    expect(spy).toHaveBeenCalledWith('ACEA5AC8E720');
  });

  it('should update current readings when realtime reading notification is received', () => {
    fixture.detectChanges();
    readingsSubject.next({
      action: 'INSERT',
      id: 100,
      sensorUid: 'ACEA5AC8E720',
      deviceName: 'Central Station',
      timestamp: '2026-10-05T20:00:00Z',
      temperature: 28.5,
      humidity: 55.0,
      co2: 450.0,
      pm10Small: 5.0,
      pm25: 12.0,
      pm10: 18.0
    });

    const readings = component.currentReadings();
    const updated = readings.find(r => r.deviceId === 'ACEA5AC8E720');
    expect(updated).toBeTruthy();
    expect(updated?.temperature).toBe(28.5);
    expect(updated?.co2).toBe(450.0);
  });

  it('should delegate sensor status updates to SensorService when notification received', () => {
    fixture.detectChanges();
    sensorStatusSubject.next({
      sensorId: 1,
      uidSensor: 'ACEA5AC8E720',
      name: 'Central Sensor',
      previousStatus: 'ONLINE',
      newStatus: 'MAINTENANCE',
      active: true,
      lastSeen: '2026-10-05T20:10:00Z'
    });

    expect(mockSensorService.handleStatusNotification).toHaveBeenCalledWith({
      sensorId: 1,
      uidSensor: 'ACEA5AC8E720',
      name: 'Central Sensor',
      newStatus: 'MAINTENANCE',
      active: true,
      lastSeen: '2026-10-05T20:10:00Z'
    });
  });
});

